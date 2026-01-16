import Cookies from "js-cookie";

const useAuth = () => {
  const token = Cookies.get("token"); 
  const isLoggedIn = !!token; 

  return { isLoggedIn, token };
}

export default useAuth;