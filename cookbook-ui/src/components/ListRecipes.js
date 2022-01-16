import React from 'react';

import {useGetRecipesQuery} from "../services/api";
import {Link} from 'react-router-dom';
import {Container, List, ListItemButton, ListItemText} from "@mui/material";

const ListRecipes = () => {
  const {data, isLoading} = useGetRecipesQuery();
  return (
    <Container>
      <List>
        {data && !isLoading && data.map(r => (
          <ListItemButton component={Link} to={`/view/${r.id}`}>
            <ListItemText primary={r.name}/>
          </ListItemButton>
        ))}
      </List>
    </Container>
  );
}

export default ListRecipes;
