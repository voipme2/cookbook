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
      query: id => `/recipes/${id}`,
      providesTags: ['Recipe']
    }),
    saveRecipe: build.mutation({
      query: ({ ...recipe }) => ({
        url: '/recipes',
        method: 'POST',
        body: recipe
      }),
      invalidatesTags: ['SearchRecipe']
    }),
    updateRecipe: build.mutation({
      query: ({ id, ...recipe }) => ({
        url: `/recipes/${id}`,
        method: 'POST',
        body: recipe
      }),
      invalidatesTags: ['Recipe'],
    }),
    deleteRecipe: build.mutation({
      query: ({ id }) => ({
        url: `/recipes/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SearchRecipe']
    })
  })
})

export const {
  useGetRecipesQuery,
  useSearchQuery,
  useGetOneQuery,
  useSaveRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = api;
