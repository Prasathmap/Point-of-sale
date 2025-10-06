const getTokenFromLocalStorage = localStorage.getItem("grn")
  ? JSON.parse(localStorage.getItem("grn"))
  : null;

export const config = {
  headers: {
    Authorization: `Bearer ${
      getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""
    }`,
    Accept: "application/json",
  },
};
