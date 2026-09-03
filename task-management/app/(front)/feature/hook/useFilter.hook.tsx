import { useState, useCallback } from "react";
import { IFilterModel } from "../../model/filter.model";
import { Ipriority, ISpecials, IStatus } from "../../model/type/type";

type FilterFormState = Omit<IFilterModel, "id" | "user">;

const initialState: FilterFormState = {
  name: "",
  tags: [],
  description: "",
  priority: undefined,
  start_date: undefined,
  end_date: undefined,
  specials: "none",     
  status: "pending", 
};

export function useFilterForm(defaultValues?: Partial<FilterFormState>) {
  const [form, setForm] = useState<FilterFormState>({
    ...initialState,
    ...defaultValues,
  });

  const setField = useCallback(
    <K extends keyof FilterFormState>(key: K, value: FilterFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      };
    });
  }, []);

  const setPriority = useCallback((priority: Ipriority | undefined) => {
    setField("priority", priority);
  }, [setField]);

  const setSpecials = useCallback((specials: ISpecials) => {
    setField("specials", specials);
  }, [setField]);

  const setStatus = useCallback((status: IStatus) => {
    setField("status", status);
  }, [setField]);

  const reset = useCallback(() => {
    setForm({ ...initialState, ...defaultValues });
  }, [defaultValues]);

  const isValid = form.name.trim().length > 0;

  return {
    form,
    setField,
    setPriority,
    setSpecials,
    setStatus,
    toggleTag,
    reset,
    isValid,
  };
}