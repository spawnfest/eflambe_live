defmodule EflambeLive.FlameGraph do
  use Kino.JS, assets_path: "lib/assets"

  def new(file) do
    Kino.JS.new(__MODULE__, file)
  end
end
