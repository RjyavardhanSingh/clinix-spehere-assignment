import User from "../models/User";

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user after authentication
        const user = await User.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};