import Gokin from "./gokin-api";
import swal from "sweetalert2";

const $ = document.querySelector.bind(document);

const getField = (elem) => (...vList) => vList.map((v) => elem.querySelector(`.${v}`).value);
const getAccount = (elem) => () => getField(elem)('grade', 'classId', 'id');
const getClickInElemContext = (id, cb, after=true) => {
	const parent = $(`#${id}`);

	$(`#${id} button`).addEventListener('click', async (ev) => {
		ev.preventDefault();
		try {
			await cb(getField(parent), getAccount(parent))
			if(after) swal("성공!", "요청이 정상적으로 처리되었습니다.", "success");
		} catch(err) {
			swal("이런!", err.message, "error");
		}
	})
};

getClickInElemContext('register', async (getField, getAccount) => {
	const [grade, classId, id] = getAccount();
	const [name, password] = getField('name', 'password');

	$('#register .password').value = '';

	try {
		await Gokin.register(grade, classId, id, name, password);
	} catch(err) {
		throw err;
	}
});

getClickInElemContext('charge', async (getField, getAccount) => {
	const [grade, classId, id] = getAccount();
	const [coin, evcoin] = getField('coin', 'evcoin');

	try {
		await Gokin.charge(grade, classId, id, coin, evcoin);
	} catch(err) {
		throw err;
	}
});

getClickInElemContext('pay', async (getField, getAccount) => {
	const [grade, classId, id] = getAccount();
	const [coin] = getField('coin');

	try {
		await Gokin.pay(grade, classId, id, coin);
	} catch(err) {
		throw err;
	}
});

getClickInElemContext('account', async (getField, getAccount) => {
	const [grade, classId, id] = getAccount();

	try {
		const user = await Gokin.account(grade, classId, id);
		swal("성공!", `학번: ${user.id}<br>이름: ${user.name}<br>코인: ${user.credit}` +
			`<br>이벤트 코인: ${user.gold}`, "info");
	} catch(err) {
		throw err;
	}
}, false);
