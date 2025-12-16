const PaymentSettingsModel = require("../../Model/Admin/PaymentSettings");
const { validUrl } = require("../../Config/function");

class PaymentSettings {
  // Get current payment redirect URL settings
  async getPaymentSettings(req, res) {
    try {
      let settings = await PaymentSettingsModel.findOne();
      
      // If no settings exist, create default
      if (!settings) {
        settings = await PaymentSettingsModel.create({
          redirectUrl: "https://justbuygold.online",
          successUrl: "https://justbuygold.online/paymentsuccess",
          cancelUrl: "https://justbuygold.online/paymentcancel",
          isVerified: false,
        });
      }
      
      return res.status(200).json({ success: settings });
    } catch (error) {
      console.error("Error getting payment settings:", error);
      return res.status(500).json({ error: "Failed to get payment settings" });
    }
  }

  // Update and verify redirect URLs
  async updateRedirectUrl(req, res) {
    try {
      const { redirectUrl, successUrl, cancelUrl, isVerified, verifiedBy } = req.body;

      // Validate URL formats
      const urlsToValidate = [];
      if (redirectUrl) urlsToValidate.push({ name: "redirectUrl", url: redirectUrl });
      if (successUrl) urlsToValidate.push({ name: "successUrl", url: successUrl });
      if (cancelUrl) urlsToValidate.push({ name: "cancelUrl", url: cancelUrl });

      for (const { name, url } of urlsToValidate) {
        if (!validUrl(url)) {
          return res.status(400).json({ error: `Invalid ${name} format` });
        }
        if (!url.startsWith("https://")) {
          return res.status(400).json({ error: `${name} must use HTTPS protocol` });
        }
      }

      let settings = await PaymentSettingsModel.findOne();

      const updateData = {};
      if (redirectUrl) updateData.redirectUrl = redirectUrl;
      if (successUrl) updateData.successUrl = successUrl;
      if (cancelUrl) updateData.cancelUrl = cancelUrl;
      if (typeof isVerified === "boolean") {
        updateData.isVerified = isVerified;
        if (isVerified) {
          updateData.verifiedBy = verifiedBy || "Admin";
          updateData.verifiedAt = new Date();
        } else {
          updateData.verifiedBy = null;
          updateData.verifiedAt = null;
        }
      }

      if (!settings) {
        // Create new settings
        settings = await PaymentSettingsModel.create({
          redirectUrl: redirectUrl || "https://justbuygold.online",
          successUrl: successUrl || "https://justbuygold.online/paymentsuccess",
          cancelUrl: cancelUrl || "https://justbuygold.online/paymentcancel",
          isVerified: isVerified || false,
          verifiedBy: isVerified ? (verifiedBy || "Admin") : null,
          verifiedAt: isVerified ? new Date() : null,
        });
        return res.status(200).json({ 
          success: settings, 
          msg: "Payment settings created successfully" 
        });
      } else {
        // Update existing settings
        settings = await PaymentSettingsModel.findOneAndUpdate(
          { _id: settings._id },
          { $set: updateData },
          { new: true }
        );
        return res.status(200).json({ 
          success: settings, 
          msg: "Payment settings updated successfully" 
        });
      }
    } catch (error) {
      console.error("Error updating payment settings:", error);
      return res.status(500).json({ error: "Failed to update payment settings" });
    }
  }

  // Verify redirect URL (admin action)
  async verifyRedirectUrl(req, res) {
    try {
      const { verifiedBy } = req.body;
      
      let settings = await PaymentSettingsModel.findOne();
      
      if (!settings) {
        return res.status(404).json({ error: "Payment settings not found" });
      }

      settings = await PaymentSettingsModel.findOneAndUpdate(
        { _id: settings._id },
        { 
          $set: { 
            isVerified: true,
            verifiedBy: verifiedBy || "Admin",
            verifiedAt: new Date()
          } 
        },
        { new: true }
      );

      return res.status(200).json({ 
        success: settings, 
        msg: "Redirect URL verified successfully" 
      });
    } catch (error) {
      console.error("Error verifying redirect URL:", error);
      return res.status(500).json({ error: "Failed to verify redirect URL" });
    }
  }
}

const PaymentSettingsController = new PaymentSettings();
module.exports = PaymentSettingsController;

