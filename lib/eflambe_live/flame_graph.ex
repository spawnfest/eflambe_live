defmodule EflambeLive.FlameGraph do
  @moduledoc """
  Kino.JS flamegraph generator for Livebook. Accepts a flamegraph SVG as an
  argument and displays it as an interactive SVG document in the livebook.
  """

  use Kino.JS, assets_path: "lib/assets"

  def new(file) do
    Kino.JS.new(__MODULE__, file)
  end
end
