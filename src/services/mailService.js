import axios from "axios";

export const sendEmail = async (body) => {
  const sendOTP = await axios.post(BACKEND_URL, body) // YOUR BACKEND URL
    .then(res => { if (res.data == "success") return 'success'; else return 'err' })
    .catch(err => { return 'err' })

  return sendOTP
}



