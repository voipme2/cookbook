import React, { useEffect } from "react";
import EditRecipe from "./EditRecipe/EditRecipe";
import { reset } from "../services/builder";
import { useDispatch } from "react-redux";

const NewRecipe = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);
  return <EditRecipe />;
};

export default NewRecipe;
