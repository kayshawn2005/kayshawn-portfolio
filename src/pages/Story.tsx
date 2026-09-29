import { Prologue } from '../story/Prologue'
import { Cafe } from '../story/Cafe'
import { TwoWorlds } from '../story/TwoWorlds'
import { NightSwim } from '../story/NightSwim'
import { Festival } from '../story/Festival'
import { Epilogue } from '../story/Epilogue'
import { NightClock } from '../story/NightClock'

/** The home page: one summer night, told in six scenes. */
export function StoryPage() {
  return (
    <main className="story">
      <Prologue />
      <Cafe />
      <TwoWorlds />
      <NightSwim />
      <Festival />
      <Epilogue />
      <NightClock />
    </main>
  )
}
