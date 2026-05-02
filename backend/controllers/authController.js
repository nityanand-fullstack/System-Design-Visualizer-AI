export const login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      message: "Login successful",
      token: process.env.ADMIN_TOKEN,
      user: { email, role: "admin" },
    });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid email or password" });
};
