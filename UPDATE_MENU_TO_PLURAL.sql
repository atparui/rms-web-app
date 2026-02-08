-- ============================================================================
-- Update Restaurant Menu Route to Plural Convention
-- ============================================================================
-- Date: 2026-02-08
-- Purpose: Align menu configuration with frontend plural routes
-- Database: rms_demo
-- Table: app_menu
-- 
-- Changes:
--   /restaurant → /restaurants (to match API and frontend)
-- ============================================================================

-- Update restaurant menu route path to plural
UPDATE app_menu 
SET route_path = '/restaurants',
    updated_at = CURRENT_TIMESTAMP
WHERE route_path = '/restaurant' 
  AND label LIKE '%Restaurant%';

-- Verify the change
SELECT 
    id, 
    label, 
    route_path, 
    is_active,
    updated_at
FROM app_menu 
WHERE label LIKE '%Restaurant%'
ORDER BY sort_order;

-- Expected result:
-- id | label       | route_path    | is_active | updated_at
-- ---+-------------+---------------+-----------+---------------------------
--  ? | Restaurants | /restaurants  | true      | 2026-02-08 XX:XX:XX

-- ============================================================================
-- To execute:
-- ============================================================================
-- 
-- Option 1: Using docker exec
-- --------------------------
-- docker exec -it foundation-postgres psql -U postgres -d rms_demo -f /path/to/this/file.sql
--
-- Option 2: Using psql client
-- --------------------------
-- psql -h localhost -U postgres -d rms_demo -f UPDATE_MENU_TO_PLURAL.sql
--
-- Option 3: Direct connection
-- --------------------------
-- docker exec -it foundation-postgres psql -U postgres -d rms_demo
-- Then paste the UPDATE statement
--
-- ============================================================================
