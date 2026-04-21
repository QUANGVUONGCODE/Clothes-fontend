function ColorDots({ colors = [] }) {
  if (!colors.length) return null;

  return (
    <div className="mb-2 flex items-center gap-2">
      {colors.map((color) => (
        <span
          key={color.id}
          className="h-7 w-7 rounded-full border-2 border-stone-300 shadow-sm"
          style={{ backgroundColor: color.code || "#ddd" }}
          title={color.name}
        />
      ))}
    </div>
  );
}

export default ColorDots;