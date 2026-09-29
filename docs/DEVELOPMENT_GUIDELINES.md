# Development Guidelines

## 1. General

Build for the actual transport workflow first.

Do not add a feature just because it is technically interesting. Every feature should reduce manual work, improve visibility, or reduce mistakes.

## 2. Code

- Use TypeScript.
- Prefer small reusable components.
- Keep components focused.
- Avoid duplicated business logic.
- Use meaningful names.
- Keep database access predictable.
- Add validation at application boundaries.

## 3. Database

- Use UUID primary keys where appropriate.
- Use timestamps for created/updated records.
- Use foreign keys for relationships.
- Do not duplicate customer or truck master data inside every trip.
- Use indexes for frequently filtered fields.
- Enable Row Level Security.

## 4. Daily Trip Entry

The daily trip workflow is the highest-priority workflow.

Required:
- Date
- Truck
- From
- To
- Customer
- Rent

The form should make these fields obvious and quick to complete.

Truck and customer should be selected from existing master records.

## 5. UI/UX

### Do
- Keep actions obvious.
- Use clear labels.
- Use meaningful empty states.
- Show success/error feedback.
- Make tables searchable when they grow.
- Keep primary actions prominent.

### Avoid
- Unnecessary popups.
- Long forms for simple operations.
- Excessive animations.
- Overly rounded generic cards everywhere.
- Tiny text.
- Information overload.

## 6. Git

Recommended branch approach:

```text
main
develop
feature/*
fix/*
```

Use meaningful commit messages.

Example:

```text
feat: add daily trip creation
fix: validate trip rent
feat: add truck management
```

## 7. Security

Never commit:
- Supabase service-role key
- Private credentials
- Production secrets
- API tokens

Frontend code may use the Supabase anon/publishable key only according to Supabase's security model, with RLS correctly configured.
