const express = require("express");
const PromoModel = require("../../Model/Admin/PromoVideo");

class Video {
  async addvideo(req, res) {
    try {
      // let file = req.files[0].filename;
      let { video } = req.body;
      const val =
        "https://www.youtube.com/embed/" + video?.slice(17, video?.length);

      const newVideo = new PromoModel({ video: val });
      newVideo.save().then((data) => {
        console.log(data);
        return res.status(200).json({ success: newVideo, msg: "Video Add" });
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, msg: "Video Not Add" });
    }
  }

  async updateVideo(req, res) {
    try {
      let { id, video } = req.body;
      const val1 =
        "https://www.youtube.com/embed/" + video?.slice(17, video?.length);

      let Obj = {};
      if (video) {
        Obj["video"] = val1;
      }
      // if (req.files) {
      //   let arr = req.files;
      //   let i;
      //   for (i = 0; i < arr?.length; i++) {
      //     if (arr[i].fieldname == "video") {
      //       Obj["video"] = arr[i].filename;
      //     }
      //   }
      // }
      let data = await PromoModel.findByIdAndUpdate(
        id,
        { $set: Obj },
        { new: true }
      );
      console.log(data);
      if (data) {
        return res.status(200).json({ success: data, msg: "Video Updated" });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Somthing went Wrong" });
    }
  }

  async removeVideo(req, res) {
    try {
      let id = req.params.id;
      const deleteVideo = await PromoModel.findByIdAndDelete({ _id: id });
      console.log(deleteVideo);
      return res
        .status(200)
        .json({ success: deleteVideo, msg: "Video Delete" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, msg: "Video Not Delete" });
    }
  }
  async getVideo(req, res) {
    try {
      const getVideo = await PromoModel.find({});
      console.log(getVideo);
      return res.status(200).json({ success: getVideo, msg: "Get Video" });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ success: false, msg: "Somthing went Wrong" });
    }
  }
}

const VideoController = new Video();
module.exports = VideoController;
