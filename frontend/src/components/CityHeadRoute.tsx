import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../App";

const CityHeadRoute = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "city_head") {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return children;
};

export default CityHeadRoute;