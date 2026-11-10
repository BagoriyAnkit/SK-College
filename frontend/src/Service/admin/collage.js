import axios from "axios"
import { API_url } from "../../config/config";


// student api
export const AddStudent = async (data) => {
  const res = await axios.post(`${API_url}/Student/add`, data)
  return res
}


export const ViewAllStudent = async (page, limit) => {
  const res = await axios.get(`${API_url}/Student/viewAll?page=${page}&limit=${limit}`);

  return res.data
};

export const FindOne = async (id, data) => {
  const res = await axios.get(`${API_url}/Student/findstudent/${id}`, data)
  return res
}

export const Update = async (id, data) => {
  const res = await axios.put(`${API_url}/Student/updatestudent/${id}`, data)
  return res
}

export const UpdateStudentStatus = async (id) => {
  const res = await axios.patch(`${API_url}/Student/status/${id}`)
  return res
}


export const Delete = async (id, data) => {
  const res = await axios.delete(`${API_url}/Student/deletestudent/${id}`, data)
  return res
}






// fees api

export const Addfees = async (data) => {
  console.log("data", data)
  const res = await axios.post(`${API_url}/Fees/add`, data)
  return res
}


export const ViewAllfees = async (page, limit) => {
  const res = await axios.get(`${API_url}/Fees/viewAll?page=${page}&limit=${limit}`);
  return res.data
};

export const FindFees = async (id) => {
  const res = await axios.get(`${API_url}/Fees/find/${id}`);
  return res.data.data;
};


export const UpdateFees = async (id, data) => {
  const res = await axios.put(`${API_url}/Fees/updatefees/${id}`, data);
  return res.data;
};

export const DeleteFees = async (id) => {
  const res = await axios.delete(`${API_url}/Fees/delete/${id}`);
  return res;
};



// Bacth api



export const Addbatch = async (data) => {

  const res = await axios.post(`${API_url}/batch/add`, data)
  return res
}


export const ViewAllbatch = async () => {
  const res = await axios.get(`${API_url}/batch/viewAll`);
  return res.data.data
};

export const UpdateStatus = async (id) => {
  const res = await axios.patch(`${API_url}/batch/status/${id}`);
  return res.data;
};

export const UpdateBatch = async (id, data) => {
  const res = await axios.put(`${API_url}/batch/update/${id}`, data);
  return res.data;
};

export const DeleteBatch = async (id) => {
  const res = await axios.delete(`${API_url}/batch/delete/${id}`);
  return res.data;
};


// Addmission api

export const Addaddmission = async (data) => {
  const res = await axios.post(`${API_url}/admission/addadmission`, data)
  return res
}

export const ViewAlladdmission = async (data) => {
  const res = await axios.get(`${API_url}/admission/ViewAll`)
  return res.data.data
}

export const Updatestatus = async (id) => {
  const res = await axios.patch(`${API_url}/admission/status/${id}`);
  return res.data;
};

export const UpdateAddmission = async (id) => {
  const res = await axios.put(`${API_url}/admission/updateadmission/${id}`);
  return res.data;
};

export const DeleteAddmission = async (id) => {
  const res = await axios.delete(`${API_url}/admission/delete/${id}`);
  return res.data;
};








// notice api

export const AddNotice = async (data) => {
  const res = await axios.post(`${API_url}/notice/add`, data)
  return res
}

export const ViewAllNotice = async (data) => {
  const res = await axios.get(`${API_url}/notice/ViewAll`)
  return res.data.data
}

export const UpdateNotice = async (id) => {
  const res = await axios.put(`${API_url}/notice/update/${id}`);
  return res.data;
};


export const DeleteNotice = async (id) => {
  const res = await axios.delete(`${API_url}/notice/delete/${id}`);
  return res.data;
};






// placement api

export const AddPlacement = async (data) => {
  const res = await axios.post(`${API_url}/placement/add`, data)
  return res
}

export const ViewAllPlacement = async (data) => {
  const res = await axios.get(`${API_url}/placement/viewAll`)
  return res.data.data
}





// exam api

export const AddExam = async (data) => {
  const res = await axios.post(`${API_url}/placement/add`, data)
  return res
}

export const ViewAllExam = async (data) => {
  const res = await axios.get(`${API_url}/placement/viewAll`)
  return res.data.data
}

export const UpdateExam = async (id) => {
  const res = await axios.put(`${API_url}/exam/update/${id}`);
  return res.data;
};

export const DeleteExam = async (id) => {
  const res = await axios.delete(`${API_url}/exam/delete/${id}`);
  return res.data;
};