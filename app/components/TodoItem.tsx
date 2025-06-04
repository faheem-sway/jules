// app/components/TodoItem.tsx
"use client";

import { useState } from 'react';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ id, text, completed, onToggleComplete, onDelete }: TodoItemProps) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggleComplete(id)}
        style={{ marginRight: '8px' }}
      />
      <span style={{ textDecoration: completed ? 'line-through' : 'none', flexGrow: 1 }}>
        {text}
      </span>
      <button onClick={() => onDelete(id)} style={{ marginLeft: '8px', cursor: 'pointer' }}>
        Delete
      </button>
    </li>
  );
}
