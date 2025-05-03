
const Phieuchamdiems = require("../models/Phieuchamdiem.cjs");

const path = require('path');
const docx = require("docx");
const { Document, Packer, Paragraph, convertInchesToTwip, WidthType, TextRun, AlignmentType, PageSize, PageOrientation, Table, TableCell, TableRow, VerticalAlign, TextDirection, HeadingLevel } = docx;
const fs = require("fs");
const Users = require("../models/Users.cjs");
const HistoriesSystem = require("../models/HistoriesSystem.cjs");
const QuantriNamChamdiem = require("../models/QuanlyNamChamdiem.cjs");
const PhieudiemNew = require("../models/PhieudiemNew.cjs");

/*Hàm tính khoảng cách giữa 2 ngày trong javascript*/
const get_day_of_time = (d1, d2) => {
  let date1 = new Date(d1);
  let date2 = new Date(d2);
  let ms1 = date1.getTime();
  let ms2 = date2.getTime();
  return Math.ceil((ms2 - ms1) / (24 * 60 * 60 * 1000));
};
const convert_range_time_format = (date) => {
  // Định nghĩa hai thời điểm
  let startDate = new Date(); // Thời gian hiện tại

  let endDate = new Date(date); // Ngày kết thúc

  // Tính khoảng cách tính bằng mili giây
  let timeDiff = endDate - startDate;
  // timeDiff = Math.abs(timeDiff)
  // console.log(timeDiff)
  // Chuyển đổi mili giây thành các đơn vị thời gian
  // đổi sang giá trị tuyệt đối để tính số ngày, giò còn lại
  let timeDiff_abs = Math.abs(timeDiff)
  let seconds = Math.floor(timeDiff_abs / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  // console.log(hours)
  // Tính số giờ, phút, giây còn lại , chia lấy phần dư
  let remainingHours = hours % 24;
  let remainingMinutes = minutes % 60;
  let remainingSeconds = seconds % 60;

  return {
    timeDiff,
    days,
    remainingHours,
    remainingMinutes,
    remainingSeconds
  }
};

const saveAction = async (user_id, action) => {
  let newAction = new HistoriesSystem({
    user: user_id,
    action: action
  })
  await newAction.save();
};

module.exports = {


  downloadFile: async (req, res) => {
    let {id_user} = req.query;
    let file = req.params.file;
    let path_file = path.join(
      __dirname,
      `../upload/${id_user}/` + file
    );
    res.download(path_file, file, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Tải file xuống thành công");
      }
    });
  },


  checkedChotdiem: async (req, res) => {
    let { year, id_user } = req.query;
    try {
      let item = await Phieuchamdiems.findOne({ year, taikhoan: id_user });
      if (!item) {
        return res.status(401).json({ message: "Chưa có bảng tự chấm điểm trong hệ thống, thao tác chốt điểm tự chấm không thể thực hiện" })
      };
      // console.log(item)
      res.status(200).json({ data: item.chotdiemtucham, idPhieucham: item._id })
    } catch (error) {

    }
  },

  saveChotdiemtucham: async (req, res) => {
    // console.log(req.body)
    let { filesSaved, filesDelete } = req.body;
    try {
      let files = req.files.map(i => {
        let path = i.path;
        let index = path.lastIndexOf('\\');
        return path.slice(index + 1)
      });

      filesDelete = JSON.parse(filesDelete);

      for (i of filesDelete) {
        fs.unlinkSync(path.join(__dirname, `../upload/${req.userId.userId}/` + i));
      }

      files = JSON.parse(filesSaved).concat(files)
      // console.log(files)
      let id = req.params.id;
      // console.log(idphieucham)
      await Phieuchamdiems.findByIdAndUpdate(id, {
        hoanthanhkhaosat: {
          status: true,
          files,
          time: new Date()
        }
      });

      await saveAction(req.userId.userId, `Hoàn thành phiếu đánh giá`)
      res.status(200).json({ message: "Hoàn thành phiếu đánh giá ý kiến", files: files })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },



  fetchBangchamthamdinh: async (req, res) => {
    let { year, taikhoan } = req.query;
    // console.log(req.query)
    year = Number(year)

    try {
      let item = await Phieuchamdiems.findOne({ year, taikhoan: taikhoan }).populate('phieukhaosat')
      if (!item) {
        return res.status(400).json({ message: "Không có bảng điểm tự chấm của đơn vị trong hệ thống phần mềm." })
      };

      let checked_namchamdiem = await QuantriNamChamdiem.findOne({
        nam: year,
        user_created: item.phieukhaosat.user_created
      });

      if (!checked_namchamdiem) {
        return res.status(401).json({ message: "Thông báo: Cơ quan cấp trên chưa tạo bảng chấm điểm năm " + year + ". Vui lòng liên hệ với cơ quan cấp trên" })
      }

      res.status(200).json({
        phieukhaosat: item
      })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },


  changeStatusChotdiem: async (req, res) => {
    let { id } = req.query;
    try {
      let item = await Phieuchamdiems.findById(id).populate("taikhoan");
      item.chotdiemtucham.status = !item.chotdiemtucham.status;
      await item.save();
      await saveAction(req.userId.userId, `Thay đổi trạng thái chốt điểm của ${item.taikhoan.tenhienthi} năm ${item.year}`)
      res.status(200).json({ message: "Thay đổi trạng thái chốt sổ thành công" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },

  



  getQuantrichamdiems: async (req, res) => {
    try {
      let list = await Quantrichamdiem.find({
      }).sort({ nam: -1 });
      res.status(200).json(list);
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra. Vui lòng liên hệ quản trị viên" + "Mã lỗi:" + error.message,
      });
    }
  },

  addQuantrichamdiem: async (req, res) => {
    try {
      let newItem = new Quantrichamdiem(req.body);
      await newItem.save();

      let list = await Quantrichamdiem.find({
      }).sort({ nam: -1 })
      res.status(200).json({ list, message: "Lưu dữ liệu thành công!" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra. Vui lòng liên hệ quản trị viên hệ thống. \n Mã lỗi: " + error.message,
      });
    }
  },

  updateQuantrichamdiem: async (req, res) => {
    let { nam, status, ngayhethanchamdiem, ngayhethanthamdinh } = req.body;
    // console.log(req.body)
    nam = Number(nam)
    let id = req.params.id;
    // console.log(status)
    try {
      await Quantrichamdiem.findByIdAndUpdate(id, {
        nam, trangthai: status, ngayhethanchamdiem, ngayhethanthamdinh
      });

      let list = await Quantrichamdiem.find({
      }).sort({ nam: -1 })

      res.status(200).json({ list, message: "Update dữ liệu thành công!" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi update. Vui lòng liên hệ quản trị viên",
      });
    }
  },

  deleteQuantrichamdiem: async (req, res) => {
    let id = req.params.id;
    try {
      await Quantrichamdiem.findByIdAndDelete(id);
      let list = await Quantrichamdiem.find({
      }).sort({ nam: -1 });

      res.status(200).json({ list, message: "Thao tác xóa thành công!" })
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },

  //xóa phiếu chấm điểm....
  resetPhieuchamdiem: async (req, res) => {
    let id = req.params.id; //id phieu cham muon xoa
    try {
      let item = await Phieuchamdiems.findById(id).populate('taikhoan');
      for (let i of item.phieuchamdiem) {
        for (let e of i.tieuchi_group) {
          for (let el of e.tieuchithanhphan) {
            if (el.files.length > 0) {
              for (let file of el.files) {
                fs.unlinkSync(path.join(__dirname, `../upload/${req.userId.userId}/` + file));
              }
            }
          }
        }
      };

      if (item.chotdiemtucham.files.length > 0) {
        for (let file of item.chotdiemtucham.files) {
          fs.unlinkSync(path.join(__dirname, `../upload/${req.userId.userId}/` + file));
        }
      };

      await saveAction(req.userId.userId, `Reset phiếu chấm điểm của ${item.taikhoan.tenhienthi} năm ${item.year}`)
      await Phieuchamdiems.findByIdAndDelete(id);
      res.status(200).json({ message: "Xóa phiếu chấm điểm thành công!" })
    } catch (error) {

    }
  },


  fetchLichsuHethong: async (req, res) => {
    try {
      let { tentaikhoan, tungay, denngay, action, id } = req.query;
      console.log(id)
      if (tungay === "") {
        tungay = new Date("1970-01-01T00:00:00Z");
      } else {
        tungay = new Date(`${tungay}T00:00:00Z`)
      }
      // console.log(action)
      denngay = new Date(`${denngay}T23:59:59Z`);

      let accounts_con = await Users.find({capcha: id});
      accounts_con = accounts_con.map(i=>i._id)
      let items = await HistoriesSystem.find({
        action: { $regex: action, $options: "i" },
        user: {$in: accounts_con},
        createdAt: {
          $gte: tungay,
          $lte: denngay,
        }
      }).populate("user").sort({ createdAt: -1 });
// console.log(items[0])
      items = items.filter(i => i.user.tenhienthi.toLowerCase().indexOf(tentaikhoan.toLowerCase()) !== -1)
      res.status(200).json(items)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  }
};
