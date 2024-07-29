const bcrypt = require("bcrypt")

// const hashPassword = async (pw) => {
//   const salt = await bcrypt.genSalt(10)
//   const hash = await bcrypt.hash(pw, salt)
//   console.log(salt) //* これがランダムだからhashも変わる
//   console.log(hash)
// }
// hashPassword("123456")

const login = async (pw, hashPw) => {
  const result = await bcrypt.compare(pw, hashPw)
  if (result) {
    console.log("ログイン成功")
  } else {
    console.log("ログイン失敗")
  }
}

//* さっきのhash後の値つかう　$2b$14$0bxe.vFU08sTGbSJE9ak0uDilm9ijGshRkKUk102u8injVkUUI15O

// login("123456","$2b$14$0bxe.vFU08sTGbSJE9ak0uDilm9ijGshRkKUk102u8injVkUUI15O")

const hashPassword = async (pw) => {
  const hash = await bcrypt.hash(pw, 10)
  console.log(hash)
}

hashPassword("123456")
