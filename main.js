import prompts from "prompts";
import axios from "axios";
import qrcode from "qrcode";
import PN from "persian-number";
await showMenu();

async function showMenu() {
  const menu = [
    {
      type: "select",
      name: "menu",
      message: "Choose one of these operations:",
      choices: [
        {
          title: "1.PID Checker",
          description: "This operator checks your personal id",
          value: "item1",
        },
        {
          title: "2.Holidays",
          description: "give me a date time, and i check if its holiday or not",
          value: "item2",
        },
        {
          title: "3.QRCode encoder",
          description: "give me a link and i make a QRcode for it",
          value: "item3",
        },
        {
          title: "4.Numbers",
          description: "write a number , get the converted number as words",
          value: "item4",
        },
      ],
    },
  ];
  let response = await prompts(menu);
  if (response.menu == "item1") {
    await personalIdHandler();
  } else if (response.menu == "item2") {
    await holidayHandler();
  } else if (response.menu == "item3") {
    await qrcodeHandler();
  } else if (response.menu == "item4") {
    await numberHandler();
  }
}

async function personalIdHandler() {
  const pid = {
    type: "text",
    name: "personalID",
    message: "Enter your personal id",
    style: "default",
    validate: (number) => {
      if (number.length != 10) return "Invalid personal id";
      if (isNaN(number)) return "Invalid personal id";
      return true;
    },
  };
  const response = await prompts(pid);
  console.log(response.personalID);
  const res = await axios.get(`https://api.codebazan.ir/codemelli/`, {
    params: {
      code: response.personalID,
    },
  });
  if (res.data.Ok == false || res.data.Result != "The code is valid") {
    console.log("Invalid");
  } else {
    console.log("Valid");
  }
  handleContinue();
}
async function holidayHandler() {
  const yearPrompt = {
    type: "number",
    name: "year",
    message: "Enter a year",
    initial: 1403,
    style: "default",
    min: 1000,
    max: 1403,
  };
  const yearResponse = await prompts(yearPrompt);
  const year = yearResponse.year;

  const monthPrompt = {
    type: "select",
    name: "month",
    message: "Pick a month",
    choices: [
      { title: "Farvardin", value: "1" },
      { title: "Ordibehesht", value: "2" },
      { title: "Khordad", value: "3" },
      { title: "Tir", value: "4" },
      { title: "Mordad", value: "5" },
      { title: "Shahrivar", value: "6" },
      { title: "Mehr", value: "7" },
      { title: "Aban", value: "8" },
      { title: "Azar", value: "9" },
      { title: "Dey", value: "10" },
      { title: "Bahman", value: "11" },
      { title: "Esfand", value: "12" },
    ],
    initial: 1,
  };
  const monthResponse = await prompts(monthPrompt);
  const month = parseInt(monthResponse.month, 10);

  let maxDay;
  if (1 <= month && month <= 6) {
    maxDay = 31;
  } else if (7 <= month && month <= 11) {
    maxDay = 30;
  } else if (month === 12) {
    maxDay = 29;
  } else {
    console.error("Invalid month");
    return;
  }

  const dayPrompt = {
    type: "number",
    name: "day",
    message: `Enter a day (1-${maxDay})`,
    validate: (day) => 1 >= day <= maxDay,
  };
  const dayResponse = await prompts(dayPrompt);
  const day = dayResponse.day;
  try {
    const res = await axios.get(
      `https://holidayapi.ir/jalali/${year}/${month}/${day}`
    );
    console.log(res.data.events);
    handleContinue();
  } catch (error) {
    console.error(error);
  }
}
async function qrcodeHandler() {
  const getLink = {
    type: "text",
    name: "link",
    message: `give me your link`,
    style: "default",
  };
  const linkResponse = await prompts(getLink);
  const userLink = linkResponse.link;
  qrcode.toString(userLink, { type: `terminal` }, (err, qrcode) => {
    if (err) console.log(`${err}`);
    else console.log(qrcode);
    console.log(`Link : ${userLink}`);
    handleContinue();
  });
}
async function numberHandler() {
  const number = {
    type: "number",
    name: "number",
    message: "give me a number",
    initial: 0,
    style: "default",
  };
  const numResponse = await prompts(number);
  const userNum = numResponse.number;
  const word = PN.convert(userNum);
  console.log(`${userNum} be horoof mishe : ${word}`);
  handleContinue();
}
async function handleContinue() {
  const confirmation = {
    type: "confirm",
    name: "value",
    message: "Do you want to continue?",
    initial: true,
  };
  const response = await prompts(confirmation);
  if (response.value) {
    showMenu();
  } else {
    console.log("Ok Bye!");
  }
}
