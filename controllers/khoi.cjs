const Khois = require("../models/Khois.cjs");
const Users = require("../models/Users.cjs");
module.exports = {
  getKhois: async (req, res) => {
    // console.log(req.query)
    try {
      let khois = await Khois.find({user_created: req.query.user_created}).sort({ thutu: 1 });
      res.status(200).json(khois);
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi lấy danh sách khối, hệ, lực lượng. Vui lòng liên hệ quản trị viên",
      });
    }
  },
  fetchKhoiActive: async (req, res) => {
    try {
      console.log(req.query)
      let khois = await Khois.find({status: true, user_created: req.query.user_created}).sort({ thutu: 1 });
      res.status(200).json(khois);
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi lấy danh sách khối, hệ, lực lượng. Vui lòng liên hệ quản trị viên",
      });
    }
  },
  addKhoi: async (req, res) => {
    let {tenkhoi, thutu, status, user_created} = req.body;
    try {
        let khoi = new Khois({tenkhoi, thutu, status, user_created});
        await khoi.save();

        let khois = await Khois.find({user_created}).sort({thutu: 1})
        res.status(200).json({khois, message: "Thêm mới khối, hệ, lực lượng thành công!"})
    } catch (error) {
        console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi thêm mới khối, hệ, lực lượng. Vui lòng liên hệ quản trị viên",
      });
    }
  },

  updateKhoi: async (req, res) => {
    let {tenkhoi, thutu, status, user_created} = req.body;
 
    let id = req.params.id;
    try {
      await Khois.findByIdAndUpdate(id,{
        tenkhoi, thutu, status
      });

      let khois = await Khois.find({user_created}).sort({thutu: 1})

      res.status(200).json({khois, message: "Update khối, hệ, lực lượng thành công!"})
  } catch (error) {
      console.log("lỗi: ", error.message);
    res.status(401).json({
      status: "failed",
      message: "Có lỗi xảy ra khi update khối, hệ, lực lượng. Vui lòng liên hệ quản trị viên",
    });
  }
  },

  deleteKhoi:  async (req, res) => {
    let id = req.params.id;
    try {
      let checked = await Users.findOne({
        khoi : id
      });

      if(checked!== null){
        const error = new Error('Thao tác xóa thất bại do có tài khoản thuộc khối bạn muốn xóa. Vui lòng kiểm tra lại hành động xóa');
        error.status = 401;
        throw error;
      };
      await Khois.findByIdAndDelete(id);
      let khois = await Khois.find({user_created: req.query.user_created}).sort({thutu: 1});

      res.status(200).json({khois, message: "Xóa khối, hệ, lực lượng thành công!"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  }

};
