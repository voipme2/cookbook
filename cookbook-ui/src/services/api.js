import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  tagTypes: ['Recipe', 'SearchRecipe'],
  endpoints: (build) => ({
    getRecipes: build.query({
      query: () => "/recipes",
      transformResponse: resp => resp.sort((a,b) => (a.name > b.name ? 1 : -1 )),
      providesTags: ['Recipe']
    }),
    search: build.query({
      query: q => `/search?query=${q}`,
      transformResponse: resp => resp.sort((a,b) => (a.name > b.name ? 1 : -1 )),
      providesTags: ['SearchRecipe']
    }),
    getOne: build.query({
      query: id => `/recipes/${id}`
    })
  })
})

export const {
  useGetRecipesQuery,
  useSearchQuery,
  useGetOneQuery
} = api;
