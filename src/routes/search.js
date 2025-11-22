const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../model/user");
const ConnectionRequest = require("../model/connectionRequest");

const searchRouter = express.Router();

// GET /search - Search for users with filters
searchRouter.get('/search', userAuth, async (req, res) => {
    try {
        const { 
            skills, 
            location, 
            minExperience, 
            maxExperience, 
            availability,
            gender,
            minAge,
            maxAge,
            searchText,
            page = 1,
            limit = 20
        } = req.query;

        const query = {};
        
        // Exclude current user from results
        query._id = { $ne: req.user._id };

        // Skills filter (partial match on any skill)
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            if (skillsArray.length > 0) {
                query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
            }
        }

        // Location filter (case-insensitive partial match)
        if (location) {
            query.location = new RegExp(location.trim(), 'i');
        }

        // Experience range filter
        if (minExperience !== undefined || maxExperience !== undefined) {
            query.experience = {};
            if (minExperience !== undefined) {
                query.experience.$gte = parseInt(minExperience);
            }
            if (maxExperience !== undefined) {
                query.experience.$lte = parseInt(maxExperience);
            }
        }

        // Availability filter
        if (availability && ['available', 'busy', 'not-looking'].includes(availability)) {
            query.availability = availability;
        }

        // Gender filter
        if (gender && ['male', 'female', 'other'].includes(gender)) {
            query.gender = gender;
        }

        // Age range filter
        if (minAge !== undefined || maxAge !== undefined) {
            query.age = {};
            if (minAge !== undefined) {
                query.age.$gte = parseInt(minAge);
            }
            if (maxAge !== undefined) {
                query.age.$lte = parseInt(maxAge);
            }
        }

        // Text search across name and about (partial match)
        if (searchText && searchText.trim()) {
            const searchRegex = new RegExp(searchText.trim(), 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { about: searchRegex },
                { title: searchRegex }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute search query
        const users = await User.find(query)
            .select('firstName lastName emailId photoUrl about skills title location experience availability')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const totalCount = await User.countDocuments(query);

        // Get connection status for each user
        const usersWithConnectionStatus = await Promise.all(
            users.map(async (user) => {
                // Check if there's a connection request between current user and this user
                const connectionRequest = await ConnectionRequest.findOne({
                    $or: [
                        { fromUserId: req.user._id, toUserId: user._id },
                        { fromUserId: user._id, toUserId: req.user._id }
                    ]
                });

                return {
                    ...user,
                    connectionStatus: connectionRequest ? connectionRequest.status : null,
                    isConnected: connectionRequest?.status === 'accepted'
                };
            })
        );

        res.json({
            success: true,
            data: usersWithConnectionStatus,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalResults: totalCount,
                resultsPerPage: parseInt(limit)
            }
        });

    } catch (err) {
        console.error('Search error:', err);
        res.status(400).json({ 
            success: false, 
            message: "Search failed: " + err.message 
        });
    }
});

// GET /search/suggestions - Get skill suggestions for autocomplete
searchRouter.get('/search/suggestions', userAuth, async (req, res) => {
    try {
        const { type } = req.query;

        if (type === 'skills') {
            // Get unique skills from all users
            const skills = await User.distinct('skills');
            res.json({ success: true, data: skills.filter(s => s) });
        } else if (type === 'locations') {
            // Get unique locations from all users
            const locations = await User.distinct('location');
            res.json({ success: true, data: locations.filter(l => l) });
        } else {
            res.status(400).json({ success: false, message: 'Invalid suggestion type' });
        }
    } catch (err) {
        console.error('Suggestions error:', err);
        res.status(400).json({ 
            success: false, 
            message: "Failed to fetch suggestions: " + err.message 
        });
    }
});

module.exports = searchRouter;
