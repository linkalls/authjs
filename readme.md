# 認証と認可について

## 認証(authentication)とは

認証はユーザーが**誰であるか**を確認するプロセス。
ユーザー名とパスワードの組み合わせとか本人しかわからない質問などを組み合わせることがある

## 認可(authorization)とは

認可はユーザーが**何ができるか**を確認するプロセス。
一般的にはユーザー認証後に認可を行う。
管理者だけ実行できるようにしたりするのもこれ。
投稿した本人だったら消していいよ とかもそう。

## パスワードはそのまま保存しない

パスワードを使いまわししてる人が多いから db に不正アクセスされたとき危ない。
これの対策としては次のものがある

### パスワードのハッシュ化

パスワードをそのまま保存するんじゃなくてパスワードを**ハッシュ関数**にかけてからその結果を db に保存する

#### ハッシュ関数とは

任意のサイズの入力データを固定サイズの出力値に変換する関数
| 入力値 | ハッシュ関数後の結果 |
|--------|--------------|
| `hello` | `f3wff3f4g4g5jy7kl8ul6j4et3w4t2t` |
| `worldqaqaqaqaqa` | `34rj4i5tjefjowfmj3443sdw2e22dh7` |

だからログインするときとかも受け取ったパスワードとかユーザー id とをハッシュ化してそれと db 内のハッシュ化された値を比較して一緒なら認証が成功
**ハッシュ関数は同じ入力値なら絶対に同じ結果になる**

#### 暗号化的ハッシュ関数とは

- 一方向性で元に戻せない(db 内のハッシュ化された値を盗まれたとしても元のパスワードはわからない)
  **これの具体例**

```js
Math.abs();
```

というので js では絶対値を求められる。
これを使って一方向性を説明できる。
**例えば**
結果が以下の時元の値は何だったか
(x という変数に何が入ってるかはわからない)

```js
Math.abs(x); //=> 10
```

この時**x**という変数に入ってたのは**10** だったのか **-10**だったのかがわからない
これが**一方向性**

- 入力によって値が大きく変化する

| 入力文字列 | ハッシュ値                                                 |
| :--------- | ------------------------------------------------------------------ |
| `hello`    | `2cf24dba5fb0a30e26e83b2ac5b0e63b7e1d6d7e9a4bfb57e2d8c7f41a9de49d` |
| `hello!`   | `7f9d4e388dd22d4315c36f7a67c9c446e5b885a0c1eec11dc522f8bba89c5e78` |
| `helloo`   | `bcf4f3d1b8f5d4a0382a64a1d0e9b05dfe7072f24e5a704f96cf9156dcb2e3b8` |
| `helloo `  | `a7e9c0d7e8f56a79f12d9c33485c3f7b5c5b2f2e0097c5d7aef2a47866f72a9`  |
| `helloo  ` | `20d4e8b93e1a3f98dc8fae9ae4d7a4f6a7f70e7b9f2c5f3e66b40b9ec9b8d2e`  |
| `hello\n`  | `d9b8d741f3d9be84e2b4e0b3ecf7b2ff79a17a167b80fcdb2e0d08b5fcf3f52`  |

- 同じ入力だったらずっと同じ出力になる
- 異なる入力から同じ出力が出る可能性は限りなく低い(事実上不可能)
- 関数の実行が意図的に遅い(パスワードのトライを遅くできる)

#### 問題点

```js
password: 123456;
```

みたいなことをしてた人がいるとする
123456 とかはよく使いまわされてて同じハッシュ関数に同じ入力値を突っ込んだら同じ値が返ってくる。
世の中のハッシュ関数が bcrypt しかないと
これだとハッシュ値を見たあとよく使われてるパスワードを bcrypt にかけてみると一致しちゃうかもしれない
**これを解決するために salt が作られた**

### salt とは

- ハッシュ化する前にパスワードに加わるランダムな値のこと
- 他では容易に作られない一意なハッシュを保証して一般的なセキュリティ攻撃を軽減するのに役立つ
  **例**
  | ユーザー名 | パスワード | ソルト | ハッシュ化前のデータ | ハッシュ化後のデータ |
  | ---------- | ----------- | ------ | -------------------- | -------------------------------- |
  | user1 | password123 | abc123 | password123abc123 | 5f4dcc3b5aa765d61d8327deb882cf99 |
  | user2 | password123 | def456 | password123def456 | 25d55ad283aa400af464c76d713c07ad |
  | user3 | password123 | ghi789 | password123ghi789 | 2a5f6d12e89a62e477a9136f6a7e56b8 |

## salt のメリット

セキュリティが強化できる

### bcrypt とは

パスワードハッシュ化関数
jsの場合は2種類ある
- bcrypt(どこでも動く 全部js おそめ)
- bcrpytjs(c++でできててバックエンドのみ　高速)
##### 今回はbcryptにする
```js
bcrypt.genSalt(saltRounds)// これでsalt作る
bcrypt.hash //* これでハッシュ生成
```
saltRoundsは難易度みたいなもん 10とか12が多い

```js
const bcrypt = require("bcrypt")

const hashPassword = async () => {
 const salt = await bcrypt.genSalt(10)
console.log(salt)
}
hashPassword()
```
これを2回やってみたら

```js
$2b$10$GJYiiq4KmExZCh1he/A3q.
$2b$10$AQfx7mDBrem6QEyn77lJP.
```
Usage
```js

async (recommended)
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
To hash a password:
Technique 1 (generate a salt and hash on separate function calls):

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        // Store hash in your password DB.
    });
});

```

index.jsのとき
```js
const bcrypt = require("bcrypt")

const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(pw, salt)
   console.log(salt)
  console.log(hash)
}
hashPassword("123456")
```
結果は
```js
$2b$10$O.70Y7GdmlOHQWTcqtdUuu
$2b$10$O.70Y7GdmlOHQWTcqtdUuuEzYfiqz2/tP00WBYk/xqEzDdQS9Tq5K
```