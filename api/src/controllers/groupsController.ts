import { Request, Response } from 'express';
import { DatabaseInterface, RecipeGroup } from '../types';

const groupsController = {
  list: async (_req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groups = await db.listGroups();
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list groups.' });
    }
  },

  get: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      const group = await db.getGroup(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found.' });
        return;
      }
      res.json(group);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get group.' });
    }
  },

  create: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const { name, description } = req.body;
      
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Group name is required.' });
        return;
      }

      const groupId = await db.createGroup({ name: name.trim(), description });
      res.json({ id: groupId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create group.' });
    }
  },

  update: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      const { name, description } = req.body;
      
      const updates: Partial<RecipeGroup> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;

      await db.updateGroup(groupId, updates);
      res.json({ id: groupId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update group.' });
    }
  },

  delete: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      await db.deleteGroup(groupId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete group.' });
    }
  },

  getGroupRecipes: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      const recipes = await db.getGroupRecipes(groupId);
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get group recipes.' });
    }
  },

  addRecipeToGroup: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      const { recipeId } = req.body;
      
      if (!recipeId) {
        res.status(400).json({ error: 'Recipe ID is required.' });
        return;
      }

      await db.addRecipeToGroup(groupId, recipeId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add recipe to group.' });
    }
  },

  removeRecipeFromGroup: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const groupId = req.params['groupId'] ?? '';
      const recipeId = req.params['recipeId'] ?? '';
      
      await db.removeRecipeFromGroup(groupId, recipeId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove recipe from group.' });
    }
  },

  getRecipeGroups: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const recipeId = req.params['recipeId'] ?? '';
      const groups = await db.getRecipeGroups(recipeId);
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get recipe groups.' });
    }
  },
};

export default groupsController; 