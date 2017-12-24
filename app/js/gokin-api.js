const queryString = require('query-string');
const pad2 = (str) => parseInt(str) < 10 ? `0${str}` : `${str}`;

const ADMIN_TOKEN = require('../../config.json').adminToken;
const API_ROOT = "http://localhost:8080";
const API_VERSION = 2;
const API_RESPONSE = {
	0: "성공",
	1: "알 수 없는 오류",
	2: "아이디의 형식이 잘못됨",
	3: "계정이 이미 있음",
	4: "잘못된 비밀번호",
	5: "토큰의 형식이 잘못됨",
	6: "토큰이 만료되었거나 존재하지 않음",
	7: "골드가 부족함",
	8: "올바르지 못한 크레딧 포맷",
	9: "올바르지 못한 요청",
	10: "계정이 존재하지 않음"
}

class Token {
	constructor(token, date = new Date()) {
		this.token = token;
		this.date = date;
	}

	renew() {
		return Gokin.renew(this.token);
	}

	get isExpired() {
		return this.date.getTime() + 10 * 60 * 1000 < Date.now();
	}
}

class StatusError extends Error {
	constructor(res) {
		super(API_RESPONSE[res]);
		this.status = res;
	}
}

class Gokin {
	static async score(token, game, score) {
		try {
			await Gokin.request('score')({gameId: game, score, token});
		} catch(err) {
			console.error(err);
			throw err;
		}
	}

	static async highScore(game, limit=5) {
		try {
			console.log(game);
			const res = await Gokin.request('rank')({
				game, limit: 5
			});

			console.log(res);
			return JSON.parse(res.rank);
		} catch(err) {
			throw err;
		}
	}

	static async login(grade, classId, id, password) {
		try {
			const loginData = await Gokin.request('verify')({
				grade: parseInt(grade),
				class: parseInt(classId),
				id: parseInt(id),
				password
			});
			return User.fromToken(loginData.token);
		} catch(err) {
			throw err;
		}
	}

	static async pay(grade, classId, id, amount) {
		try {
			await Gokin.request('pay')({
				id: Gokin.toId(grade, classId, id),
				credit: parseInt(amount),
				token: ADMIN_TOKEN
			});
		} catch(err) {
			throw err;
		}
	}

	static async charge(grade, classId, id, credit, gold=0) {
		try {
			await Gokin.request('charge')({
				grade: parseInt(grade),
				class: parseInt(classId),
				id: parseInt(id),
				credit: parseInt(credit),
				gold: parseInt(gold),
				token: ADMIN_TOKEN
			});
		} catch(err) {
			throw err;
		}
	}

	static async account(grade, classId, id) {
		try {
			return await Gokin.request('accountinfo')({
				grade: parseInt(grade),
				class: parseInt(classId),
				id: parseInt(id),
				token: ADMIN_TOKEN
			});
		} catch(err) {
			throw err;
		}
	}

	static async register(grade, classId, id, name, password) {
		try {
			await Gokin.request('register')({
				grade: parseInt(grade),
				class: parseInt(classId),
				id: parseInt(id),
				name,
				password
			});
		} catch(err) {
			throw err;
		}
	}

	static request(methodName) {
		return async (payload) => {
			const request = await fetch(`${API_ROOT}/api/v${API_VERSION}/${methodName}`, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/x-www-form-urlencoded"
				},
				method: 'post',
				body: queryString.stringify(payload)
			});
			const requestData = await request.json();

			if(requestData.res === 0) return requestData;
			else throw new StatusError(requestData.res);
		};
	}

	static toId(grade, classId, id) {
		return `${grade}${pad2(classId)}${pad2(id)}`;
	}
}

Gokin.StatusError = StatusError;

class User {
	constructor(token, id, name, credit, gold) {
		this.id = id;
		this.name = name;
		this.credit = credit;
		this.eventCredit = gold;
		this.token = token;
	}

	async pay(amount) {
		try {
			await Gokin.request('pay')({credit: parseInt(amount), token: this.token});
		} catch(err) {
			throw err;
		}
	}

	async score(game, score) {
		try {
			await Gokin.score(this.token, game, score);
		} catch(err) {
			throw err;
		}
	}

	async renew() {
		try {
			await Gokin.request('renew')({token: this.token});
		} catch(err) {
			throw err;
		}
	}

	async update() {
		try {
			const accountData = await Gokin.request('account')({token: this.token});
			this.id = accountData.id;
			this.name = accountData.name;
			this.credit = accountData.credit;
			this.gold = accountData.gold;
		} catch(err) {
			throw err;
		}
	}

	static async fromToken(token) {
		try {
			const accountData = await Gokin.request('account')({token});
			return new User(token, accountData.id, accountData.name, accountData.credit, accountData.gold);
		} catch(err) {
			throw err;
		}
	}
}

export default Gokin;
