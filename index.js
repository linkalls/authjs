const bcrypt = require("bcrypt")

const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(pw, salt)
   console.log(salt) //* これがランダムだからhashも変わる
  console.log(hash)
}
hashPassword("123456")
