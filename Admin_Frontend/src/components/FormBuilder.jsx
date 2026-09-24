import { useState, useCallback } from 'react';
import { useToast } from './Toast';
import { adminApi, ApiError } from '../api/adminApi';

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'image', label: 'Image' },
  { value: 'signature', label: 'Signature' },
  { value: 'file', label: 'File' }
];

export const blankField = () => ({
  fieldId: `f_${Math.random().toString(36).slice(2, 8)}`,
  label: '',
  type: 'text',
  key: '',
  required: false,
  placeholder: '',
  options: [],
  defaultValue: '',
  helpText: '',
  width: 'full',
  maxFileSize: undefined,
  allowedImageTypes: ['image/jpeg', 'image/png'],
  isMultiple: false,
  sortOrder: 0
});

export default function useFormBuilder({ initial }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [exam, setExam] = useState(initial?.exam ?? '');
  const [fields, setFields] = useState(() => (initial?.fields && initial.fields.length ? initial.fields : [blankField()]));
  const [selectedIndex, setSelectedIndex] = useState(null);

  const updateField = useCallback((index, patch) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }, []);

  const addField = useCallback(() => {
    const newField = blankField();
    setFields((prev) => [...prev, newField]);
    setSelectedIndex(fields.length);
  }, [fields]);

  const setSelected = (index) => setSelectedIndex(index);

  const duplicateField = useCallback((index) => {
    const copy = { ...fields[index], fieldId: `f_${Math.random().toString(36).slice(2, 8)}` };
    setFields((prev) => [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
    setSelectedIndex(index + 1);
  }, [fields]);

  const removeField = useCallback((index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex(null);
  }, []);

  const moveField = useCallback((index, dir) => {
    setFields((prev) => {
      const next = [...prev];
      const [target] = next.splice(index, 1);
      next.splice(index + dir, 0, target);
      setSelectedIndex(index + dir);
      return next;
    });
  }, []);

  const addOption = useCallback((index) => {
    updateField(index, { options: [...(fields[index]?.options || []), { label: '', value: '' }] });
  }, [fields, updateField]);

  const updateOption = useCallback((fieldIndex, optIndex, patch) => {
    const options = [...(fields[fieldIndex]?.options || [])];
    if (options[optIndex]) options[optIndex] = { ...options[optIndex], ...patch };
    updateField(fieldIndex, { options });
  }, [fields, updateField]);

  const removeOption = useCallback((fieldIndex, optIndex) => {
    const options = (fields[fieldIndex]?.options || []).filter((_, i) => i !== optIndex);
    updateField(fieldIndex, { options });
  }, [fields, updateField]);

  const handleImageUpload = useCallback(async (index, file) => {
    if (!file) return;
    try {
      const data = await adminApi.forms.uploadImage(file);
      const current = fields[index]?.defaultValue || '';
      const nextValue = current ? `${current}\n${data.url}` : data.url;
      updateField(index, { defaultValue: nextValue });
      addToast('Image uploaded', 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Upload failed', 'error');
    }
  }, [fields, updateField, addToast]);

  const reorder = useCallback((draggedIndex, hoverIndex) => {
    setFields((prev) => {
      const next = [...prev];
      const [dragged] = next.splice(draggedIndex, 1);
      next.splice(hoverIndex, 0, dragged);
      return next;
    });
  }, []);

  const setInitial = useCallback((data) => {
    if (!data) return;
    setTitle(data.title ?? '');
    setDescription(data.description ?? '');
    setExam(data.exam ?? '');
    setFields(data.fields || (data.fields?.length ? [] : [blankField()]));
  }, []);

  const payload = useCallback(() => ({
    title,
    description,
    exam,
    fields: fields.map((f, i) => ({ ...f, sortOrder: i }))
  }), [title, description, exam, fields]);

  return {
    state: { title, description, exam, fields, selectedIndex },
    handlers: {
      setTitle,
      setDescription,
      setExam,
      addField,
      removeField,
      duplicateField,
      moveField,
      updateField,
      addOption,
      updateOption,
      removeOption,
      handleImageUpload,
      reorder,
      setSelected,
      setInitial
    },
    payload
  };
}
