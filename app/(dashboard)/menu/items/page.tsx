import { redirect } from 'next/navigation';

/**
 * /menu/items → redirect to /menu-items for compatibility with external links.
 */
export default function MenuItemsRoute() {
  redirect('/menu-items');
}
