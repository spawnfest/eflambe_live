defmodule EflambeLive do
  @moduledoc """
  Public API for EflambeLive. This API mirrors the API provided by :eflambe.
  """

  alias EflambeLive.FlameGraph

  # These options are needed for to format eflambe flamegraphs for Livebook and
  # cannot be overridden by the user when generating flamegraphs for Livebook
  @livebook_eflambe_options [return: :flamegraph, output_format: :svg]

  @doc """
  Invoke a function and render a flamegraph of the function execution
  callstack.

  The function and args must be specified as a {fun, args} tuple or a
  {module, fun, args} tuple.

  The function will be invoked by livebook and the flamegraph will be displayed
  in the cell below the code cell containing the `apply/2` call as an SVG
  image.
  """

  @spec apply({fun(), list()} | {module(), atom(), list()}, Keyword.t()) :: Kino.JS.t()

  def apply(function_and_args, options \\ []) do
    complete_options = Keyword.merge(options, @livebook_eflambe_options)
    content = :eflambe.apply(function_and_args, complete_options)
    display_flamegraph(content)
  end

  @doc """
  "Capture" an invocation of a function anywhere on the Erlang node and render
  a flamegraph of the function execution callstack.

  The function as a {module, function, arity} tuple.

  This function will not return until the function you are "capturing" is
  invoked. When the function returns a flamegraph will be displayed in the
  cell below the code cell containing the `apply/2` call as an SVG image.
  """

  @spec capture(mfa(), integer(), Keyword.t()) :: Kino.JS.t()

  def capture(mfa, num_calls, options \\ []) do
    complete_options = Keyword.merge(options, @livebook_eflambe_options)
    {:ok, content} = :eflambe.capture(mfa, num_calls, complete_options)
    display_flamegraph(content)
  end

  defp display_flamegraph(image_io) do
    image_io
    |> IO.iodata_to_binary()
    |> FlameGraph.new()
  end
end
