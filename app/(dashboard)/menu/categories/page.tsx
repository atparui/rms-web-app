import { redirect } from 'next/navigation';

/**
 * /menu/categories → redirect to /menu-categories for compatibility with external links.
 */
export default function MenuCategoriesRoute() {
  redirect('/menu-categories');
}
