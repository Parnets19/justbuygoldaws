const ReferralModel = require("../../Model/User/Referral"); // Adjust the path as necessary
const authModel = require("../../Model/User/Auth"); // Assuming you have an Auth model for users
const Referralpricemodel = require("../../Model/Admin/RefferalPrice");
 const WalletHistorymodel = require("../../Model/User/WalletHistory"); // 

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const addReferral = async (req, res) => {
  try {
    const { userId,referral } = req.body; // Assume userId is passed in the request body
    console.log("userId",userId)
    // // Check if the user exists (optional, but recommended)
    // const user = await AuthModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Generate a referral code
    // const referralCode = generateReferralCode();

    // Create the referral document
    const referrall = new ReferralModel({
      UserId: userId,
      referral:referral,
    //   referral: referralCode,
      status: "Active", // Default status, can be omitted if it's the default
    });

    // Save to the database
    await referrall.save();

    // Respond with the newly created referral
    res.status(201).json({
      message: "Referral created successfully",
      referrall,
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
    const useReferralCode = async (req, res) => {
      try {
        const { referral,receiverId} = req.body; // Assume referralCodeInput is passed in the request body
         
        // Find the referral code in the database
        const findreferral = await ReferralModel.findOne({ referral: referral });
        const isReceived = await ReferralModel.findOne({ receiverId });

        if (isReceived) {
          return res.status(400).json({
            message: "Already you used referral code.",
          });
        }
        if (!findreferral) {
          return res.status(404).json({ message: "Referral code not found" });
        }
        if (findreferral.receiverId === receiverId) {
              return res.status(400).json({
                message: "This referral code has already been used by Someone.",
              });
            }
        
    
        // Check if the referral code is already inactive
        // if (findreferral.status === "Inactive") {
        //   return res.status(400).json({
        //     message: "This referral code has already been used.",
        //   });
        // }
    
        // If the referral code is found and active, update its status to "Inactive"
        // findreferral.status = "Inactive";
         findreferral.receiverId = receiverId; // Assuming you want to associate the receiver with the referral code
        // price
        const dataPrice = await Referralpricemodel.findOne({});
        findreferral.userreferralrupees = Number(((dataPrice.referralprice)/2).toFixed(2));

        await findreferral.save();
     
        return res.status(200).json({
          message: "Referral code used successfully",
          referral,
        });
      } catch (error) {
        console.error("Error using referral code:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };
    
// uyGUDYGWUS

const cHANGEstatus = async (req, res) => {
      try {
        const { receiverId} = req.body; // Assume referralCodeInput is passed in the request body
       
        // Find the referral code in the database
    
        const isReceived = await ReferralModel.findOne({ receiverId });

        if (!isReceived) {
            return res.status(400).json({
                message: "referral code is not available",
            });
        }


        
        // Check if the referral code is already inactive
        // if (isReceived.status === "Inactive") {
        //   return res.status(400).json({
        //     message: "This referral code has already been used.",
        //   });
        // }
       
        const receiverData = await authModel.findOne({_id: receiverId});
        if(!receiverData){
            return res.status(400).json({message: "User is not available!"});
        }
     
        
        if(receiverData?.totalEarnedMoney){
            const updateWalletMoney = await authModel.findOneAndUpdate(
                {
                    _id: receiverData._id
                },
                {
                    $inc: {
                        totalEarnedMoney: -receiverData?.totalEarnedMoney
                    }
                }, {new: true}
            );
            if(!updateWalletMoney){
                return res.status(400).json({message : "Please try again!"})
            }
            if(updateWalletMoney){
                const updateWalletHistory = await WalletHistorymodel.create({
                    UserId: receiverData._id,
                 
                    amount: receiverData?.totalEarnedMoney,
                    status: "DEBIT"
                });
            }
        }
    
        // If the referral code is found and active, update its status to "Inactive"
        
        const dataPrice = await Referralpricemodel.findOne({});
        isReceived.userreferralrupees = dataPrice.referralprice;
        if (isReceived.status === "Active") {
            isReceived.status = "Inactive";
            const updateWalletMoney = await authModel.findOneAndUpdate({_id: isReceived.UserId}, {
                $inc: {
                    totalEarnedMoney: dataPrice.referralprice
                }
            }, {new: true});
            if(!updateWalletMoney){
                return res.status(400).json({error: "Please try again!"})
            }
            
            if(updateWalletMoney){
                const updateWalletHistory = await WalletHistorymodel.create({
                    UserId: isReceived.UserId,
                    receiverId: receiverId,
                    amount: dataPrice.referralprice,
                    status: "CREDIT"
                });
            }
        }
        await isReceived.save();
        return res.status(200).json({
          message: "Referral DICOUNT code used successfully and set to Inactive"
         
        });
      } catch (error) {
        console.error("Error using referral code:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };





const getreferalCode = async (req, res) => {
      const { id } = req.params;
      console.log("id",id)
  try {
    const refCode = await ReferralModel.findOne({ receiverId: id });
    res.status(200).json(refCode);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAllReferrals = async (req, res) => {
  try {
    const referrals = await ReferralModel.find({});
    res.status(200).json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getReferralById = async (req, res) => {
  try {
    const { id } = req.params; // Get the referral ID from the request parameters

    // Find the referral by ID
    const referral = await ReferralModel.findById(id);

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Check the status of the referral
    const isActive = referral.status === 'Active';

    res.status(200).json({ 
      referral, 
      isActive,
      message: isActive ? "Referral is active" : "Referral is inactive" 
    });
  } catch (error) {
    console.error("Error fetching referral:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserReferralStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all referrals made by the user
    const referrals = await ReferralModel.find({ UserId: userId });

    if (!referrals || referrals.length === 0) {
      return res.status(404).json({ message: "No referrals found for this user." });
    }
    // Calculate the total rupees earned from inactive codes
    const totalRupeesEarned = referrals
      .filter(referral => referral.status === "Inactive")
      .reduce((sum, referral) => sum + referral.userreferralrupees, 0);

    res.status(200).json({ totalRupeesEarned });
  } catch (error) {
    console.error('Error fetching referral stats:', error); // Log the error for debugging
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

// Controller function to update referral earnings after payment
const updateReferralEarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentAmount } = req.body; // Amount paid

    // Fetch all referrals made by the user
    const referrals = await ReferralModel.find({ UserId: userId, status: "Inactive" });

    if (!referrals || referrals.length === 0) {
      return res.status(404).json({ message: "No inactive referrals found for this user." });
    }

    // Calculate the total rupees earned
    let totalRupeesEarned = referrals
      .reduce((sum, referral) => sum + referral.userreferralrupees, 0);

    // Check if paymentAmount is greater than totalRupeesEarned
    if (paymentAmount > totalRupeesEarned) {
      return res.status(400).json({ message: "Payment amount exceeds the total earned amount." });
    }

    // Update the total amount by deducting the payment amount
    let remainingAmount = totalRupeesEarned - paymentAmount;

    // Update the `userreferralrupees` field for each referral
    await Promise.all(referrals.map(async (referral) => {
      if (paymentAmount <= 0) return; // No more amount to deduct

      if (referral.userreferralrupees <= paymentAmount) {
        paymentAmount -= referral.userreferralrupees;
        referral.userreferralrupees = 0; // Set to zero after deduction
      } else {
        referral.userreferralrupees -= paymentAmount;
        paymentAmount = 0; // Fully deducted
      }

      await referral.save();
    }));

    // Update totalRupeesEarned in the response
    res.status(200).json({ remainingAmount });
  } catch (error) {
    console.error('Error updating referral earnings:', error); // Log the error for debugging
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


module.exports = { addReferral,useReferralCode,getAllReferrals,getReferralById,
getreferalCode,cHANGEstatus,getUserReferralStats,updateReferralEarnings };
