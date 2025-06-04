// app/components/TodoItem.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';

describe('TodoItem', () => {
  const mockOnToggleComplete = jest.fn();
  const mockOnDelete = jest.fn();
  const todo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockOnToggleComplete.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders the todo text', () => {
    render(
      <TodoItem
        {...todo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('shows as not completed initially', () => {
    render(
      <TodoItem
        {...todo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByText('Test Todo')).not.toHaveStyle('text-decoration: line-through');
  });

  it('shows as completed when completed prop is true', () => {
    render(
      <TodoItem
        {...todo}
        completed={true}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('Test Todo')).toHaveStyle('text-decoration: line-through');
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    render(
      <TodoItem
        {...todo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TodoItem
        {...todo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});
