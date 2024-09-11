import  {Request, Response} from 'express';
import bcrypt  from 'bcrypt'
import { UserModel, IUser } from '../models/users';
import { signToken } from '../middleware/jwt'
import { Types } from 'mongoose';



export const registerUser = async(req: Request, res: Response): Promise<void> => {
        const {username, email, password, role} = req.body;

    try {
        //check input fields
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Please fill in all fields' });
            return;
        }

        //check password length
        if (password.length < 6) {
            res.status(400).json({message: "Password should be minimum of 6 characters"});
            return;
            }

        //check for existing user
        const existingUser = await UserModel.findOne({ email })

        if (existingUser) {
            res.status(409).json({ status: false, message: 'User already exists' });
            return;
            }//conflict --> Existing User
    

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

            
        //create  new User
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user' // Default role is user, if user does not choose
        });

        //Generate access token --> jwt
        const accessToken = signToken({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

        res.status(201).json({
            status: 'success',
            accessToken,
            data: {
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                    }
                }
            });
            
        } catch (err) {
            console.error('Error in user registration:', err);
            res.status(500).json({message: 'Internal server error'})
    }
};


export const loginUser = async ( req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body;

    try {
        //Check input fields
        if (!email || !password){
            res.status(400).json({
                message: 'Please provide email and password'
            });
            return;
        }

        //Find user by email
        const user = await UserModel.findOne({ email });

        if(!user) {
            res.status(401).json({
                message: 'Invalid email'
            });
            return;
        }

        //Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            res.status(401).json({
                message: 'Password is not correct'
            });
            return;
        }

        //Generate sign token
        const accessToken = signToken({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        res.status(201).json({
            status: 'success',
            accessToken,
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                    }
                }
            });

    } catch (err) {
        console.error('Error in user login', err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

//Get User
export const getUser = async ( req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        const user = await UserModel.findById(userId).select('-password');

        if(!user) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

//Update User profile
export const updateUserProfile = async ( req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { username, email } = req.body;

        //check for duplicate email
        if(email){
            const duplicateEmail = await UserModel.findOne({ email, _id: { $ne: userId } });
            if (duplicateEmail) {
                res.status(409).json({
                    message: 'Email already in use'
                });
                return;
            }
        }

    const updateUser = await UserModel.findByIdAndUpdate(
        userId,
        {$set: {username, email}},
        {new: true, runValidators: true} ).select('-password');

        if(!updateUser) {
            res.status(404).json({ message: 'User not found'});
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {user: updateUser }
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};