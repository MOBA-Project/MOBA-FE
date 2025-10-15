const jwt = require("jsonwebtoken");

let users = [];

exports.checkId = (req, res) => {
  const { id } = req.body;
  const isDuplicate = users.some((user) => user.id === id);
  return res.status(isDuplicate ? 409 : 200).json({
    message: isDuplicate
      ? "이미 사용 중인 아이디입니다."
      : "사용 가능한 아이디입니다.",
  });
};

exports.signup = (req, res) => {
  const { id, pw, nick } = req.body;
  if (!id || !pw) {
    return res
      .status(400)
      .json({ message: "아이디와 비밀번호를 입력해주세요." });
  }
  users.push({ id, pw, nick });
  res.status(201).json({ message: "회원가입이 완료되었습니다." });
};

exports.login = (req, res) => {
  const { id, pw } = req.body;
  const user = users.find((user) => user.id === id && user.pw === pw);
  if (!user) {
    return res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ token });
};

exports.protected = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token)
    return res.status(403).json({ message: "토큰이 제공되지 않았습니다." });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });

    const user = users.find((u) => u.id === decoded.id);
    if (user) {
      return res.json({ message: "인증 성공", nick: user.nick, id: user.id });
    } else {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }
  });
};

// 회원정보 수정: 닉네임/비밀번호 변경 (데모: 메모리 저장)
exports.update = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token)
    return res.status(403).json({ message: "토큰이 제공되지 않았습니다." });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });

    const { nick, pw, currentPw } = req.body || {};
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    // 현재 비밀번호 확인 필수
    if (!currentPw || user.pw !== currentPw) {
      return res.status(401).json({ message: "현재 비밀번호가 올바르지 않습니다." });
    }
    if (typeof nick === "string" && nick.trim()) user.nick = nick.trim();
    if (typeof pw === "string" && pw.trim()) user.pw = pw.trim();

    return res.json({ message: "수정되었습니다.", id: user.id, nick: user.nick });
  });
};
