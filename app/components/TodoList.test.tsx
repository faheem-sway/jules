// app/components/TodoList.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from './TodoList';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('TodoList', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    // You might need to mock other things like Date.now() if IDs depend on it and you need deterministic IDs
  });

  it('renders an empty list initially when localStorage is empty', () => {
    render(<TodoList />);
    expect(screen.getByText('My ToDo List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a new todo')).toBeInTheDocument();
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  it('adds a new todo when the add button is clicked', () => {
    render(<TodoList />);
    const input = screen.getByPlaceholderText('Add a new todo');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'New Test Todo' } });
    fireEvent.click(addButton);

    expect(screen.getByText('New Test Todo')).toBeInTheDocument();
    expect(input).toHaveValue(''); // Input should be cleared
    expect(screen.queryByText('No todos yet. Add one above!')).not.toBeInTheDocument();
  });

  it('adds a new todo when Enter key is pressed in input', () => {
    render(<TodoList />);
    const input = screen.getByPlaceholderText('Add a new todo');

    fireEvent.change(input, { target: { value: 'Enter Key Todo' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('Enter Key Todo')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('toggles todo completion status', () => {
    render(<TodoList />);
    const input = screen.getByPlaceholderText('Add a new todo');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Completable Todo' } });
    fireEvent.click(addButton);

    const todoText = screen.getByText('Completable Todo');
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    expect(todoText).not.toHaveStyle('text-decoration: line-through');

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(todoText).toHaveStyle('text-decoration: line-through');

    fireEvent.click(checkbox); // Toggle back
    expect(checkbox).not.toBeChecked();
    expect(todoText).not.toHaveStyle('text-decoration: line-through');
  });

  it('deletes a todo when delete button is clicked', () => {
    render(<TodoList />);
    const input = screen.getByPlaceholderText('Add a new todo');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Deletable Todo' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Deletable Todo')).toBeInTheDocument();

    const deleteButton = screen.getByText('Delete'); // Assumes only one todo, hence one delete button
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Deletable Todo')).not.toBeInTheDocument();
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument(); // List should be empty
  });

  it('loads todos from localStorage on initial render', () => {
    const initialTodos = [
      { id: '1', text: 'Stored Todo 1', completed: false },
      { id: '2', text: 'Stored Todo 2', completed: true },
    ];
    localStorageMock.setItem('todos', JSON.stringify(initialTodos));

    render(<TodoList />);

    expect(screen.getByText('Stored Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Stored Todo 2')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
});
