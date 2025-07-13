import { Router, Request, Response } from 'express';
import groupsController from '../controllers/groupsController';
import { DatabaseInterface } from '../types';

export default function (database: DatabaseInterface) {
  const db = database;
  const router = Router();
  
  // List all groups
  router.get('/groups', (req: Request, res: Response) => {
    groupsController.list(req, res, db);
  });
  
  // Get a specific group
  router.get('/groups/:groupId', (req: Request, res: Response) => {
    groupsController.get(req, res, db);
  });
  
  // Create a new group
  router.post('/groups', (req: Request, res: Response) => {
    groupsController.create(req, res, db);
  });
  
  // Update a group
  router.put('/groups/:groupId', (req: Request, res: Response) => {
    groupsController.update(req, res, db);
  });
  
  // Delete a group
  router.delete('/groups/:groupId', (req: Request, res: Response) => {
    groupsController.delete(req, res, db);
  });
  
  // Get recipes in a group
  router.get('/groups/:groupId/recipes', (req: Request, res: Response) => {
    groupsController.getGroupRecipes(req, res, db);
  });
  
  // Add a recipe to a group
  router.post('/groups/:groupId/recipes', (req: Request, res: Response) => {
    groupsController.addRecipeToGroup(req, res, db);
  });
  
  // Remove a recipe from a group
  router.delete('/groups/:groupId/recipes/:recipeId', (req: Request, res: Response) => {
    groupsController.removeRecipeFromGroup(req, res, db);
  });
  
  // Get groups for a specific recipe
  router.get('/recipes/:recipeId/groups', (req: Request, res: Response) => {
    groupsController.getRecipeGroups(req, res, db);
  });
  
  return router;
} 