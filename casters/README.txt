Caster / host headshots for the Schedule overlay.

Names come from assets/csv/casters.csv; the overlay loads each photo from
assets/img/casters/<name>.png (e.g. Uomi -> Uomi.png). Use transparent or square
PNGs sized consistently.

casters.csv columns (flexible):
  - Name column: "Name" / "Caster" / "Host" (or the first column; "team_name" is
    accepted for the current file).
  - Role  (optional): shown under the name, e.g. Caster / Host.
  - Image (optional): explicit filename; defaults to "<Name>.png".
