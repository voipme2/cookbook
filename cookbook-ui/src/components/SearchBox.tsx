import { Autocomplete, TextField } from "@mui/material";
import React, { useState } from "react";
import { useSearchQuery } from "../services/api";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "./SearchResult";

export function SearchBox() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useSearchQuery(searchValue);
  return (
    <Autocomplete
      freeSolo
      options={searchResults ?? []}
      onChange={(_, value) => {
        if (value && typeof value !== "string") {
          navigate(`/view/${value.id}`);
        }
      }}
      filterOptions={(x) => x}
      loading={isLoading || isFetching}
      onInputChange={(event, newValue) => setSearchValue(newValue)}
      inputValue={searchValue}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.name
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Recipes"
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <SearchResult recipe={option} highlight={searchValue} {...props} />
      )}
    />
  );
}
