const express = require("express");
const GoldModel = require("../../Model/Admin/GoldRate");

class GoldRate {
  async addrate(req, res) {
    try {
      let { name, rate, percentage } = req.body;
      const Newrate = await new GoldModel({ name, rate, percentage });
      Newrate.save().then((data) => {
        console.log(data);
        return res.status(200).json({ msg: "New rate add", success: "true" });
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Rate not add", success: "false" });
    }
  }

  async updaterate(req, res) {
    try {
      let { id, name, rate, percentage } = req.body;
      let Obj = {};
      if (name) {
        Obj["name"] = name;
      }
      if (rate) {
        Obj["rate"] = rate;
      }
      if (percentage) {
        Obj["percentage"] = percentage;
      }

      let goldrate = await GoldModel.findByIdAndUpdate(
        id,
        { $set: Obj },
        { new: true }
      );
      console.log(goldrate);
      return res.status(200).json({ success: goldrate, msg: "Rate update !" });
      return;
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, msg: "Rate not update !" });
    }
  }

  async deletrate(req, res) {
    try {
      let id = req.params.id;
      const ratedelete = await GoldModel.findByIdAndDelete({ _id: id });
      console.log(ratedelete);
      return res
        .status(200)
        .json({ success: ratedelete, msg: "Rate Delete !" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, msg: "Rate Not Delete !" });
    }
  }

  async getrate(req, res) {
    try {
      const getallrate = await GoldModel.find({}).sort({ rate: -1 });

      return res.status(200).json({ success: getallrate, msg: "Get All Rate" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, msg: "Something wrong" });
    }
  }
}

const GoldController = new GoldRate();
module.exports = GoldController;
