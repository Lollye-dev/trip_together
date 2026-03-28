import "../styles/AddExpenseForm.css";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Member = {
  id: number;
  firstname?: string;
  email?: string;
};

type AddExpenseFormProps = {
  tripId: number;
  members: Member[];
  onSuccess: () => void;
};

type ExpenseCategory = {
  id: number;
  name: string;
};

function AddExpenseForm({ tripId, members, onSuccess }: AddExpenseFormProps) {
  const { auth } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      if (!auth?.token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/expenses/categories`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erreur chargement catégories");
        }

        const data = (await response.json()) as ExpenseCategory[];
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.token) {
      console.error("Utilisateur non authentifié");
      return;
    }

    if (!title || !amount || !categoryId || !paidBy || !date) {
      console.error("Champs manquants");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            tripId,
            title,
            amount: Number(amount),
            paid_by: Number(paidBy),
            category_id: Number(categoryId),
            date,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur création dépense");
      }

      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h2>Ajouter une dépense</h2>

      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Montant"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
      >
        <option value="">Choisir une catégorie</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        required
      >
        <option value="">Payé par</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.firstname || member.email}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button type="submit">Enregistrer</button>
    </form>
  );
}

export default AddExpenseForm;
