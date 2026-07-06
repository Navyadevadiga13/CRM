import axiosClient from "./axiosClient";

export interface CreateStudentPayload {
  name: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  interestedCountry: string;
  intakeMonth: string;
  intakeYear: string;
  remarks: string;
}

export const getStudents = async () => {
  const response = await axiosClient.get("/students/all");
  return response.data;
};

export const searchStudents = async (
  search: string
) => {
  const response = await axiosClient.get(
    `/students/search?search=${search}`
  );

  return response.data;
};

export const filterStudents = async (
  leadStatus: string,
  interestedCountry: string
) => {
  const response = await axiosClient.get(
    `/students/filter`,
    {
      params: {
        leadStatus,
        interestedCountry,
      },
    }
  );

  return response.data;
};

export const getStudent = async (
  id: string
) => {
  const response = await axiosClient.get(
    `/students/${id}`
  );

  return response.data;
};

export const createStudent = async (
  data: CreateStudentPayload
) => {
  const response = await axiosClient.post(
    "/students/create",
    data
  );

  return response.data;
};

export const updateStudent = async (
  id: string,
  data: any
) => {
  const response = await axiosClient.put(
    `/students/update/${id}`,
    data
  );

  return response.data;
};

export const updateLeadStatus = async (
  id: string,
  leadStatus: string
) => {
  const response = await axiosClient.patch(
    `/students/status/${id}`,
    { leadStatus }
  );

  return response.data;
};

export const assignPartner = async (
  id: string,
  partnerId: string
) => {
  const response = await axiosClient.patch(
    `/students/assign-partner/${id}`,
    { partnerId }
  );

  return response.data;
};

export const assignCityHead = async (
  id: string,
  cityHeadId: string
) => {
  const response = await axiosClient.patch(
    `/students/assign-city-head/${id}`,
    { cityHeadId }
  );

  return response.data;
};

export const updateRemarks = async (
  id: string,
  remarks: string
) => {
  const response = await axiosClient.patch(
    `/students/remarks/${id}`,
    { remarks }
  );

  return response.data;
};

export const updateFollowUp = async (
  id: string,
  followUpDate: string
) => {
  const response = await axiosClient.patch(
    `/students/followup/${id}`,
    { followUpDate }
  );

  return response.data;
};

export const toggleStudentStatus = async (
  id: string
) => {
  const response = await axiosClient.patch(
    `/students/toggle/${id}`
  );

  return response.data;
};

export const deleteStudent = async (
  id: string
) => {
  const response = await axiosClient.delete(
    `/students/${id}`
  );

  return response.data;
};