// app/page.tsx
import TodoList from './components/TodoList'; // Adjusted import path

export default function Home() {
  return (
    <main style={{ padding: '20px' }}>
      <TodoList />
    </main>
  );
}
