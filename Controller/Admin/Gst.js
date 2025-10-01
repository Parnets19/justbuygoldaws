const GstModel = require("../../Model/Admin/Gst");
const { isValidNum } = require("../../Config/function");

class GST {
  async addgst(req, res) {
    try {
      const { Sgst, Cgst } = req.body;
      if (Sgst) {
        if (!isValidNum(Sgst))
          return res.status(400).json({ error: "State gst should be number" });
      }
      if (Cgst) {
        if (!isValidNum(Cgst))
          return res
            .status(400)
            .json({ error: "Central gst should be number" });
      }
      let data = await GstModel.findOne();
      if (!data) {
        let newgst = await GstModel.create({ Sgst, Cgst });
        console.log(newgst);
        return res
          .status(200)
          .json({ success: newgst, msg: "Successfull added" });
      } else {
        await GstModel.findOneAndUpdate(
          { _id: data._id },
          { $set: { Sgst, Cgst } },
          { new: true }
        );
        return res.status(200).json({ success: "Successfull updated" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getGst(req, res) {
    try {
      let data = await GstModel.findOne();
      if (!data) return res.status(400).json({ error: "No gst added" });
      return res.status(200).json({ success: data });
    } catch (error) {
      console.log(error);
    }
  }

async editGst(req, res) {
    try {
      const { id } = req.params;
      const { Sgst, Cgst } = req.body;

      if (Sgst && !isValidNum(Sgst)) {
        return res.status(400).json({ error: "State gst should be number" });
      }
      if (Cgst && !isValidNum(Cgst)) {
        return res.status(400).json({ error: "Central gst should be number" });
      }

      let updated = await GstModel.findByIdAndUpdate(
        id,
        { $set: { Sgst, Cgst } },
        { new: true }
      );

      if (!updated) return res.status(404).json({ error: "GST record not found" });

      return res.status(200).json({ success: updated, msg: "Successfully edited" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Delete GST by ID
  async deleteGst(req, res) {
    try {
      const { id } = req.params;

      let deleted = await GstModel.findByIdAndDelete(id);

      if (!deleted) return res.status(404).json({ error: "GST record not found" });

      return res.status(200).json({ success: "GST record deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

}


const GstController = new GST();
module.exports = GstController;
