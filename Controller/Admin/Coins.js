const coinsModel = require("../../Model/Admin/Coins");

class Coins {
  async addCoins(req, res) {
    try {
      let { UserId, username, email, phone, coins,usphone } = req.body;
      const newCoins = await new coinsModel({
        UserId,
        username,
        usphone,
        email,
        phone,
        coins,
      });
      newCoins.save().then((data) => {
        return res.status(200).json({ success: "true" });
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: "false" });
    }
  }

  async getCoins(req, res) {
    try {
      const allCoins = await coinsModel.find({});
      return res.status(200).json({ success: allCoins });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: "false" });
    }
  }

  async getBuyId(req, res) {
    try {
      const id = req.params.id;
      const getCoins = await coinsModel.find({ UserId: id }).populate("UserId");
      if (getCoins?.length > 0) {
        return res.status(200).json({ success: getCoins });
      }
      return res.status(400).json({ error: "error" });
    } catch (error) {
      return res.status(400).json({ error: false });
    }
  }

  //   Approved & Hold ============================
  async ApprovedHold(req, res) {
    const { id, status } = req.body;
    try {
      const kushbhi = await coinsModel.findByIdAndUpdate(
        { _id: id },
        { $set: { status: status } },
        { new: true }
      );
      if (!kushbhi) {
        return res.status(400).json({ error: "Data Not Found" });
      }
      if (kushbhi.status == "Hold")
        return res.status(200).json({ success: "Successfully Hold" });
      return res.status(200).json({ success: "Successfully  Approved..." });
    } catch (error) {
      console.log(error);
    }
  }
}

const coinController = new Coins();
module.exports = coinController;
