import { Prologue } from '../story/Prologue'
import { Cafe } from '../story/Cafe'
import { NightSwim } from '../story/NightSwim'
import { Festival } from '../story/Festival'
import { Epilogue } from '../story/Epilogue'
import { NightClock } from '../story/NightClock'

/** The home page: one summer night, told in five scenes. */
export function StoryPage() {
  return (
    <main className="story">
      <Prologue />
      <Cafe />
      <NightSwim />
      <Festival />
      <Epilogue />
      <NightClock />
    </main>
  )
}
