const jwt = require("jsonwebtoken");
const RefreshTokens = require("../models/RefreshToken.cjs");
const fs = require('fs');
const path = require('path');
const Users = require("../models/Users.cjs");
const _ = require('lodash');
const Phieuchamdiems = require("../models/Phieuchamdiem.cjs");
const HistoriesSystem = require("../models/HistoriesSystem.cjs");
const QuantriNamChamdiem = require("../models/QuanlyNamChamdiem.cjs");
const Khois = require("../models/Khois.cjs");
const saveAction = async (user_id, action) => {
  let newAction = new HistoriesSystem({
    user: user_id,
    action: action
  })
  await newAction.save();
};


module.exports = {
  login: async (req, res) => {
    try {
      let user = await Users.findOne({
        tentaikhoan: req.body.tentaikhoan,
        matkhau: req.body.matkhau,
      });
      if (!user) {
        return res.status(401).json({ status: false, message: "Sai tên đăng nhập hoặc mật khẩu" });
      } else {
        if (user.block_by_admin === true) {
          return res.status(401).json({ status: false, message: "Tài khoản bị khóa bởi quản trị hệ thống, vui lòng liên hệ cơ quan cấp trên" })
        };
        if (user.status === false) {
          return res.status(401).json({ status: false, message: "Tài khoản bị khóa, vui lòng liên hệ cơ quan cấp trên" })
        };

        //cần kiểm tra xem client có refreshtoken k nếu có thì phải kiểm tra db và xóa đi khi login thành công và tạo mới refreshtoken
        let refreshTokenCookie = req.cookies.refreshToken;
        if (refreshTokenCookie) {
          await RefreshTokens.findOneAndDelete({ refreshToken: refreshTokenCookie })
        };

        //generate accessToken, refreshToken
        const accessToken = jwt.sign({ userId: user._id }, "vuvantinh_accessToken", {
          expiresIn: '15d'
        });

        const refreshToken = jwt.sign({ userId: user._id }, "vuvantinh_refreshToken", {
          expiresIn: '30d'
        });

        let newItem = new RefreshTokens({
          refreshToken
        });
        await newItem.save();
        await saveAction(user._id, "Đăng nhập hệ thống")
        console.log(user)
        res.status(200).json({ status: "success", _id: user._id, captaikhoan: user.captaikhoan, tentaikhoan: user.tenhienthi, accessToken, refreshToken });
      }
    } catch (error) {
      console.log(error.message)
      res.status(401).json({ status: "failed", message: "Lỗi đăng nhập hệ thống" });
    }
  },
  logout: async (req, res) => {
    //xóa refreshTonken trong database
    let refreshTokenCookie = req.cookies.refreshToken;
    try {
      if (refreshTokenCookie) {
        await RefreshTokens.findOneAndDelete({ refreshToken: refreshTokenCookie })
      };

      //xóa cookie
      // res.clearCookie('refreshToken_px01');
      res.status(200).json({ status: "success", message: "Đăng xuất thành công" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi server hệ thống" });
    }
  },
  getUserList: async (req, res) => {
    // console.log(req.query)
    try {
      let users = await Users.find({
        capcha: req.query.id_user
        // "captaikhoan": {$in:["Cấp Bộ","Cấp Cục","Cấp Tỉnh"]}
      }).populate('khoi').sort({thutu: 1})

      res.status(200).json(users)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu người dùng" });
    }
  },
  //Hàm tạo ra các tài khoản cấp Bộ và Cục, Tỉnh
  addUser: async (req, res) => {
    let { tentaikhoan, block_by_admin, id_user, captaikhoan, khoi, tenhienthi, role, status, thutu } = req.body;
    try {
      let newItem = new Users({
        tentaikhoan,
        tenhienthi,
        captaikhoan,
        matkhau: '123456',
        block_by_admin: false,
        time_block: new Date(),
        thutu,
        role,
        capcha: id_user,
        status,
        khoi
      });

      try {
        fs.mkdirSync(
          path.join(__dirname, `../upload/${newItem._id}`)
        );
        console.log('Folder created successfully (sync)!');
      } catch (err) {
        console.error('Error creating folder (sync):', err);
      };

      await newItem.save();
      await saveAction(req.userId.userId, `Thêm mới tài khoản ${tenhienthi}`);

      //lọc ra các 
      let users = await Users.find({
        capcha: id_user
      }).populate("khoi").sort({thutu: 1})
     
      res.status(200).json({ status: "success", users, message: "Thêm mới thành công" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi thêm mới người dùng" });
    }
  },
  editUser: async (req, res) => {
    // console.log('123')
    let id = req.params.id;
    // console.log(id)
    let { tentaikhoan, tenhienthi,captaikhoan, captaikhoan_user, khoi, role, status, thutu } = req.body;
   
    try {
      let item = await Users.findByIdAndUpdate(id, {
        tentaikhoan,
        thutu,
        captaikhoan,
        khoi,
        status,
        role,
        tenhienthi,
      });

      let users;
      if(captaikhoan_user === "Quản trị V03"){
        users = await Users.find({
          captaikhoan: {$in: ["Quản trị V03", "Quản trị Công an tỉnh"]}
        }).populate('khoi').sort({thutu: 1})
      }else{
        console.log(item)
        users = await Users.find({
          capcha: item.capcha
        }).populate('khoi').sort({thutu: 1})
      }
      // console.log(users)
      await saveAction(req.userId.userId, `Chỉnh sửa tài khoản ${tenhienthi}`)
      res.status(200).json({ status: "success", users, message: "Cập nhật tài khoản người dùng thành công" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật tài khoản người dùng" });
    }
  },
  deleteUser: async (req, res) => {
    let id = req.params.id;
    let captaikhoan_user = req.query;
    console.log(captaikhoan_user)
    // console.log(id)
    try {
      let item = await Users.findById(id);

      //xóa toàn bộ cuộc chấm điểm và phiếu chấm tạo bởi user
      await QuantriNamChamdiem.deleteMany({ user_created: item._id });
      await Phieuchamdiems.deleteMany({ user_created: item._id })
      await Phieuchamdiems.deleteMany({ taikhoan: item._id });

      await Users.findByIdAndDelete(id);
      let user_list_con = await Users.find({capcha: id});
      for(let i of user_list_con){
        try {
          fs.rmSync(path.join(__dirname, "../upload/" + id), { recursive: true, force: true })
          console.log('Folder removed successfully (sync)!');
        } catch (err) {
          console.error('Error removing folder (sync):', err);
        };
        await QuantriNamChamdiem.deleteMany({ user_created: i._id });
        await Phieuchamdiems.deleteMany({ user_created: i._id })
        await Phieuchamdiems.deleteMany({ taikhoan: i._id })
      }
      // await Users.deleteMany({capcha: id});
      try {
        fs.rmSync(path.join(__dirname, "../upload/" + id), { recursive: true, force: true })
        console.log('Folder removed successfully (sync)!');
      } catch (err) {
        console.error('Error removing folder (sync) lỗi:', err);
      }
      // check xem có phiếu điểm của tài khoản đang muốn xóa hay không, nếu có thì đưa ra thông báo k được xóa,
      // mà chỉ thay đổi được trạng thái sử dụng thôi
      let users;
      if(captaikhoan_user === "Quản trị V03"){
        users = await Users.find({
          captaikhoan: {$in: ["Quản trị V03", "Quản trị Công an tỉnh"]}
        }).populate('khoi').sort({thutu: 1})
        // console.log(users)
      }else{
        // console.log(item._id)
        users = await Users.find({
          capcha: item.capcha
        }).populate('khoi').sort({thutu: 1})
      }
      await saveAction(req.userId.userId, `Xóa tài khoản ${item.tentaikhoan}`)
      res.status(200).json({ status: "success", users, message: "Xóa tài khoản người dùng thành công" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi xóa người dùng" });
    }
  },
  changeStatusAccounts: async (req, res) => {
    let { data, id_user } = req.body;
    // console.log(data)
    try {
      for (let i of data) {
        let item = await Users.findById(i);
        // console.log(item)
        item.status = !item.status;
        item.time_block = new Date()
        await item.save();
      };
      let users = await Users.find({
        capcha: id_user
      }).populate('khoi')
      res.status(200).json({ users, message: "Thay đổi trạng thái hoạt động thành công!" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },
  getUserCapTinh: async (req, res) => {
    try {
      let users = await Users.find({
        "captaikhoan": {$in:["Quản trị Công an tỉnh"]},
        // status: true
      }).sort({thutu: 1});
    // console.log(users)
      res.status(200).json(users)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu người dùng" });
    }
  },
  getUserListOfCapTinh: async (req, res) => {
    let id_user = req.query.id_user;
    try {
      let users = await Users.find({
        "captaikhoan": "Cơ quan, đầu mối lấy ý kiến",
        capcha: id_user
      })
      console.log(users)

      res.status(200).json(users)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu người dùng" });
    }
  },
  changeStatusAccountsOfCapTinh: async (req, res) => {
    let { data, id_user, block_by_admin } = req.body;
    try {
      for (let i of data) {
        let item = await Users.findById(i);
        // console.log(item)
        if (block_by_admin) {
          item.block_by_admin = !item.block_by_admin;
          await item.save();
        } else {
          item.status = !item.status;
          item.time_block = new Date()
          await item.save();
        }
      };
      let users = await Users.find({
        capcha: id_user
      }).populate('khoi')
      res.status(200).json({ users, message: "Thay đổi trạng thái hoạt động thành công!" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },
  requestRefreshToken: async (req, res) => {
    // console.log(req.cookies)
    const refreshToken = req.cookies.refreshToken_chamdiemcaicach;
    // console.log(refreshToken)
    if (!refreshToken) {
      return res.status(401).json({ message: 'Token không tồn tại. Vui lòng đăng nhập' })
    };
    // console.log(refreshToken)
    // kiểm tra xem trong db có refreshtoken này không nếu k có thì là k hợp lệ
    const checkRefreshTokenInDb = await RefreshTokens.findOne({ refreshToken });
    // console.log('token',checkRefreshTokenInDb)
    // console.log(checkRefreshTokenInDb)
    if (!checkRefreshTokenInDb) return res.status(403).json({ message: "Token không hợp lệ" });

    jwt.verify(refreshToken, "vuvantinh_refreshToken", async (err, user) => {
      if (err) {
        console.log(err.message)
      };

      const newAccessToken = jwt.sign({ userId: user.userId }, "vuvantinh_accessToken", {
        expiresIn: '15d'
      });

      const newRefreshToken = jwt.sign({ userId: user.userId }, "vuvantinh_refreshToken", {
        expiresIn: '30d'
      });

      await RefreshTokens.findOneAndDelete({ refreshToken: refreshToken })
      // thêm refreshtoken mới vào db sau đó trả về client accesstoken mới
      let newItem = new RefreshTokens({
        refreshToken: newRefreshToken
      });
      await newItem.save()
      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
      console.log('ok')
    })
  },
  changePassword: async (req, res) => {
    let { id, matkhaucu, matkhaumoi } = req.body;
    try {
      let user = await Users.findOne({ _id: id, matkhau: matkhaucu });
      if (!user) {
        res.status(401).json({ message: "Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại" })
        return;
      }

      user.matkhau = matkhaumoi;
      await user.save();
      await saveAction(req.userId.userId, `Thay đổi mật khẩu`)
      res.status(200).json({ message: "Đổi mật khấu thành công. Vui lòng đăng nhập lại." })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi server, Vui lòng liên hệ quản trị hệ thống" });
    }
  },

  //lấy ra các tài khoản cấp con của 1 tài khoản
  fetchChildrenUser: async (req, res) => {
    let { id_user, year } = req.query;

    try {
      let cuocChamDiem = await QuantriNamChamdiem.findOne({  nam: year });
      if (cuocChamDiem === null) {
        return res.status(401).json({ status: "failed", message: "Chưa có cuộc lấy ý kiến khảo sát năm " + year });
      };
      
      let items = await Users.find({ capcha: id_user, captaikhoan: "Cơ quan, đầu mối lấy ý kiến", _id: {$ne: id_user} }, { _id: 1, tenhienthi: 1, time_block: 1, status: 1 }).sort({ thutu: 1 });

      items = items.filter(e => {
        let date_start_chamdiem = (new Date(cuocChamDiem.thoigianbatdautucham)).getTime();
        let date_block_user = e.status === true ? (new Date(e.time_block)).getTime() : (new Date()).getTime()
        let check = (e.status === false && date_start_chamdiem > date_block_user)
        return e.status === true || check
      })

      res.status(200).json(items)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra" });
    }
  },

  fetchAccountsTheoKhoi: async (req, res) => {
    try {
      let khois = await Khois.find({ status: true }).sort({ thutu: 1 });
      let items = [];

      for (let khoi of khois) {
        let accounts = [];
        accounts = await Users.find({
          khoi: khoi._id,
          status: true
        }).sort({ thutu: 1 });
        items.push({
          khoi: khoi.tenkhoi,
          accounts: accounts.map(i => ({
            value: i._id,
            name: i.tenhienthi
          }))
        })
      };
      res.status(200).json(items)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },
};
