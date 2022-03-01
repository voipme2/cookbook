import React, {useEffect} from 'react';
import EditRecipe from './EditRecipe';
import {load} from '../services/builder';
import {useDispatch} from 'react-redux';
import {useParams} from "react-router-dom";
import {useGetOneQuery} from "../services/api";
import {LinearProgress} from "@mui/material";

const ModifyRecipe = () => {
  const {recipeId} = useParams();
  const {data: recipe, isLoading} = useGetOneQuery(recipeId);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(recipe));
  }, [dispatch, recipe]);

  return (
    <>
      {isLoading && <LinearProgress/>}
      {!isLoading && recipe && <EditRecipe/>}
    </>)
}

export default ModifyRecipe;
