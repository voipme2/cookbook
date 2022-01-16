import React, {useState} from 'react';

import {useNavigate} from 'react-router-dom';
import {
  Container,
  List,
  ListItemButton,
  ListItemText,
  LinearProgress,
  TextField
} from "@mui/material";
import {useSearchQuery} from "../services/api";

const Results = ({query}) => {
  const {data, isLoading, isFetching} = useSearchQuery(query);
  const navigate = useNavigate();

  return (<List>
    {(isLoading || isFetching) && <LinearProgress/>}
    {data && !isLoading && data.map(s => (<ListItemButton onClick={() => navigate(`/view/${s.id}`)} key={s.id}>
      <ListItemText primary={s.name}/>
    </ListItemButton>))}
  </List>)
}

const Home = () => {
  const [query, setQuery] = useState('');

  return (
    <Container maxWidth="lg">
      <TextField fullWidth placeholder="Search" value={query} onChange={e => setQuery(e.target.value)}/>
      <Results query={query}/>
    </Container>)
}

export default Home;
