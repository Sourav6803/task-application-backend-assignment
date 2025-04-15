const { generateToken } = require("../utils/auths");

const bcrypt = require("bcryptjs");

let users = [];
let userId = 1;
console.log(users)

const findUser = (username) => users.find((user) => user.username === username);

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    if (findUser(username)) {
        return res.status(400).json({ error: "Username already exists" });
      }

    if(username.length < 3){
        return res.status(400).json({error: "Username must be at least 3 characters"})
    }

    if(password.length < 6){
        return res.status(400).json({error: "Password must be at least 6 characters"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = { id: userId++, username, password: hashedPassword };
    users.push(user);

    res.status(201).json({ message: "User registration success", user: user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = findUser(username);

    if(!user){
        return res.status(400).json({ error: "User not exists." });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid  password" });
    }

    const token = generateToken(user, res);

    res
      .status(200)
      .json({
        message: "Login Success",
        username: user.username,
        token: token,
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllUsers = (req, res) => {
    console.log("users->", users)
    res.status(200).json({ users });
  };

module.exports.register = register;
module.exports.login = login;
module.exports.users = users;
module.exports.getAllUsers = getAllUsers;

