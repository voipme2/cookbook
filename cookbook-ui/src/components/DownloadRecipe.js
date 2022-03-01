import React, {useEffect} from 'react';
import EditRecipe from './EditRecipe';
import {load} from '../services/builder';
import {useDispatch} from 'react-redux';
import {useSearchParams} from "react-router-dom";
import {useFetchRecipeQuery} from "../services/api";
import {LinearProgress} from "@mui/material";

const DownloadRecipe = () => {
  const [searchParams] = useSearchParams();
  const recipeUrl = searchParams.get('recipeUrl');
  const {data: recipe, isLoading, isFetching} = useFetchRecipeQuery({recipeUrl});

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(recipe));
  }, [dispatch, recipe]);

  return (
    <>
      {(isLoading || isFetching) && <LinearProgress/>}
      {!(isLoading || isFetching) && recipe && <EditRecipe/>}
    </>)
}

export default DownloadRecipe;
